"""Authenticated GitHub telemetry endpoints for the DevNexus dashboard."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from middleware.auth import get_current_user, get_github_token
from services import github_service

logger = logging.getLogger("devnexus.github.router")
router = APIRouter(prefix="/github", tags=["GitHub"])

LANGUAGE_COLORS = {
    "TypeScript": "#3178c6",
    "Python": "#3572a5",
    "JavaScript": "#f1e05a",
    "Rust": "#dea584",
    "Go": "#00add8",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
}


def _github_error(exc: Exception) -> HTTPException:
    logger.exception("GitHub telemetry request failed", exc_info=exc)
    return HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="GitHub telemetry is temporarily unavailable. Please retry shortly.",
    )


def _map_repo(repo: dict) -> dict:
    """Keep the existing frontend contract while using the real service fields."""
    return {
        "id": repo.get("id", ""),
        "name": repo.get("name", ""),
        "fullName": repo.get("full_name", ""),
        "description": repo.get("description") or "No description provided.",
        "stars": repo.get("stars", 0),
        "forks": repo.get("forks", 0),
        "language": repo.get("language") or "Other",
        "languageColor": LANGUAGE_COLORS.get(repo.get("language") or "", "#858585"),
        "openIssues": repo.get("open_issues", 0),
        "updatedAt": repo.get("pushed_at"),
        "healthScore": repo.get("health_score", 0),
        "topics": repo.get("topics", []),
        "url": repo.get("url", ""),
    }


@router.get("/trending")
async def get_trending(language: str | None = None):
    try:
        return await github_service.get_trending_repos(language=language)
    except Exception as exc:
        raise _github_error(exc) from exc


@router.get("/repos")
async def get_repos(token: str = Depends(get_github_token), user: dict = Depends(get_current_user)):
    try:
        repos = await github_service.get_repos(user["login"], token)
        return [_map_repo(repo) for repo in repos]
    except Exception as exc:
        raise _github_error(exc) from exc


@router.get("/stats")
async def get_stats(token: str = Depends(get_github_token), user: dict = Depends(get_current_user)):
    try:
        stats = await github_service.get_user_stats(user["login"], token)
        # The frontend expects camelCase fields. Deltas are intentionally zero
        # until the service has a time-windowed comparison rather than guesses.
        return {
            "username": stats.get("username", user["login"]),
            "name": stats.get("name"),
            "avatarUrl": stats.get("avatar_url"),
            "bio": stats.get("bio"),
            "followers": stats.get("followers", 0),
            "following": stats.get("following", 0),
            "publicRepos": stats.get("public_repos", 0),
            "totalStars": stats.get("total_stars", 0),
            "totalForks": stats.get("total_forks", 0),
            "prsMerged": stats.get("total_pull_request_contributions", 0),
            "contributionStreak": stats.get("contribution_streak", 0),
            "longestStreak": stats.get("longest_streak", 0),
            "totalContributions": stats.get("total_contributions", 0),
            "totalCommitContributions": stats.get("total_commit_contributions", 0),
            "totalIssueContributions": stats.get("total_issue_contributions", 0),
            "starsThisWeek": 0,
            "forksThisWeek": 0,
            "prsThisWeek": 0,
            "streakChange": 0,
        }
    except Exception as exc:
        raise _github_error(exc) from exc


@router.get("/contributions")
async def get_contributions(
    token: str = Depends(get_github_token),
    user: dict = Depends(get_current_user),
):
    try:
        return await github_service.get_contribution_calendar(user["login"], token)
    except Exception as exc:
        raise _github_error(exc) from exc


@router.get("/forecast")
async def get_forecast(
    token: str = Depends(get_github_token),
    user: dict = Depends(get_current_user),
):
    try:
        calendar = await github_service.get_contribution_calendar(user["login"], token)
        history = [day for week in calendar.get("weeks", []) for day in week.get("days", [])]
        forecast = github_service.forecast_commits(history)
        return [
            {
                "date": entry["date"],
                "day": entry["date"],
                "fullDay": entry["date"],
                "predicted": entry["predicted_commits"],
                "confidence": round(entry["confidence"] * 100),
            }
            for entry in forecast
        ]
    except Exception as exc:
        raise _github_error(exc) from exc
