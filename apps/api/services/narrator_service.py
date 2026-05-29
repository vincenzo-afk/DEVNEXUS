"""
DevNexus – Narrator Service
Orchestrates the pipeline for generating daily chronicles and weekly arcs,
fetching data from Supabase and GitHub, then persisting results.
"""

from __future__ import annotations

import logging
from datetime import date, timedelta
from typing import Optional

from config import settings
from services import gemini_service, github_service

logger = logging.getLogger("devnexus.narrator")


# ---------------------------------------------------------------------------
# Supabase client (lazy import to avoid circular deps)
# ---------------------------------------------------------------------------


def _get_supabase():
    from supabase import create_client
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _fetch_user_todos_completed(user_id: str, target_date: str) -> list[str]:
    """Fetch todos completed on target_date for a user."""
    try:
        supabase = _get_supabase()
        response = (
            supabase.table("todos")
            .select("title")
            .eq("user_id", user_id)
            .eq("status", "done")
            .gte("updated_at", f"{target_date}T00:00:00")
            .lte("updated_at", f"{target_date}T23:59:59")
            .execute()
        )
        return [row["title"] for row in (response.data or [])]
    except Exception as exc:
        logger.warning("Failed to fetch todos for user %s: %s", user_id, exc)
        return []


async def _fetch_user_notes(user_id: str, target_date: str) -> list[str]:
    """Fetch note titles created/updated on target_date."""
    try:
        supabase = _get_supabase()
        response = (
            supabase.table("notes")
            .select("title")
            .eq("user_id", user_id)
            .gte("updated_at", f"{target_date}T00:00:00")
            .lte("updated_at", f"{target_date}T23:59:59")
            .execute()
        )
        return [row["title"] for row in (response.data or [])]
    except Exception as exc:
        logger.warning("Failed to fetch notes for user %s: %s", user_id, exc)
        return []


async def _fetch_user_github_token(user_id: str) -> Optional[str]:
    """Retrieve the stored GitHub access token for a user."""
    try:
        supabase = _get_supabase()
        response = (
            supabase.table("users")
            .select("github_token, github_username")
            .eq("id", user_id)
            .single()
            .execute()
        )
        if response.data:
            return response.data.get("github_token"), response.data.get("github_username")
    except Exception as exc:
        logger.warning("Failed to fetch GitHub token for user %s: %s", user_id, exc)
    return None, None


async def _save_chronicle(user_id: str, chronicle: dict) -> None:
    """Persist chronicle to the chronicles table."""
    try:
        supabase = _get_supabase()
        supabase.table("chronicles").upsert(
            {
                "user_id": user_id,
                "date": chronicle["date"],
                "headline": chronicle["headline"],
                "narrative": chronicle["narrative"],
                "mood": chronicle["mood"],
            },
            on_conflict="user_id,date",
        ).execute()
        logger.info("Chronicle saved for user %s on %s", user_id, chronicle["date"])
    except Exception as exc:
        logger.error("Failed to save chronicle for user %s: %s", user_id, exc)


async def _save_weekly_arc(user_id: str, arc: dict) -> None:
    """Persist weekly arc to the weekly_arcs table."""
    try:
        supabase = _get_supabase()
        supabase.table("weekly_arcs").upsert(
            {
                "user_id": user_id,
                "week_start": arc.get("week_start"),
                "title": arc.get("title"),
                "narrative": arc.get("narrative"),
                "chapters": arc.get("chapters"),
                "epilogue": arc.get("epilogue"),
                "xp_earned": arc.get("xp_earned", 0),
                "badges": arc.get("badges", []),
            },
            on_conflict="user_id,week_start",
        ).execute()
        logger.info("Weekly arc saved for user %s", user_id)
    except Exception as exc:
        logger.error("Failed to save weekly arc for user %s: %s", user_id, exc)


# ---------------------------------------------------------------------------
# Jobs
# ---------------------------------------------------------------------------


async def generate_daily_chronicle_job(user_id: str) -> None:
    """
    Full pipeline:
    1. Fetch user's GitHub token and username
    2. Fetch recent commits from GitHub
    3. Fetch completed todos from Supabase
    4. Fetch recent notes from Supabase
    5. Generate chronicle via Gemini
    6. Save to Supabase
    """
    target_date = date.today().isoformat()
    logger.info("Generating daily chronicle for user %s on %s", user_id, target_date)

    github_token, github_username = await _fetch_user_github_token(user_id)

    commits: list[str] = []
    if github_token and github_username:
        try:
            # Use contribution calendar as proxy for today's commits
            calendar = await github_service.get_contribution_calendar(
                github_username, github_token
            )
            # Extract today's entry
            for week in reversed(calendar.get("weeks", [])):
                for day in reversed(week.get("days", [])):
                    if day.get("date") == target_date:
                        count = day.get("count", 0)
                        commits = [f"{count} commit(s) to your repositories"] if count else []
                        break
        except Exception as exc:
            logger.warning("Failed to fetch GitHub data for %s: %s", github_username, exc)

    todos = await _fetch_user_todos_completed(user_id, target_date)
    notes = await _fetch_user_notes(user_id, target_date)

    try:
        chronicle = await gemini_service.generate_daily_chronicle(
            commits=commits,
            todos=todos,
            notes=notes,
            target_date=target_date,
        )
        chronicle["date"] = target_date
        await _save_chronicle(user_id, chronicle)
    except Exception as exc:
        logger.error("Chronicle generation failed for user %s: %s", user_id, exc)


async def generate_weekly_arc_job() -> None:
    """
    Generate weekly arcs for all users (Sunday morning job).
    """
    logger.info("Starting weekly arc generation for all users")
    supabase = _get_supabase()

    try:
        users_resp = supabase.table("users").select("id").execute()
        user_ids = [row["id"] for row in (users_resp.data or [])]
    except Exception as exc:
        logger.error("Failed to fetch users for weekly arc job: %s", exc)
        return

    week_start = (date.today() - timedelta(days=6)).isoformat()

    for user_id in user_ids:
        try:
            todos = await _fetch_user_todos_completed(user_id, week_start)
            notes = await _fetch_user_notes(user_id, week_start)

            arc = await gemini_service.generate_weekly_arc(
                week_start=week_start,
                commits=[],  # Could be enhanced to fetch week's commits
                todos_completed=todos,
                hackathons=[],
                highlights=notes[:5],
            )
            arc["week_start"] = week_start
            await _save_weekly_arc(user_id, arc)
        except Exception as exc:
            logger.error("Weekly arc failed for user %s: %s", user_id, exc)

    logger.info("Weekly arc generation complete for %d users", len(user_ids))
