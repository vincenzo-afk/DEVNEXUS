"""
DevNexus – APScheduler Setup
Configures and manages the async background scheduler for narrative generation jobs.
"""

from __future__ import annotations

import asyncio
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger("devnexus.scheduler")

_scheduler: AsyncIOScheduler | None = None

# ---------------------------------------------------------------------------
# Job wrappers
# ---------------------------------------------------------------------------


async def _daily_chronicle_wrapper() -> None:
    """Wrapper that runs the daily chronicle job for all users."""
    logger.info("⏰ Daily chronicle job triggered")
    try:
        from config import settings
        from supabase import create_client

        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        users_resp = supabase.table("users").select("id").execute()
        user_ids = [row["id"] for row in (users_resp.data or [])]

        from services.narrator_service import generate_daily_chronicle_job

        tasks = [generate_daily_chronicle_job(uid) for uid in user_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        errors = [r for r in results if isinstance(r, Exception)]
        if errors:
            logger.warning("%d chronicle job(s) failed", len(errors))
        logger.info("Daily chronicle job done: %d users processed", len(user_ids))
    except Exception as exc:
        logger.error("Daily chronicle job crashed: %s", exc)


async def _weekly_arc_wrapper() -> None:
    """Wrapper that runs the weekly arc job."""
    logger.info("⏰ Weekly arc job triggered")
    try:
        from services.narrator_service import generate_weekly_arc_job
        await generate_weekly_arc_job()
    except Exception as exc:
        logger.error("Weekly arc job crashed: %s", exc)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def start_scheduler() -> None:
    """Initialise and start the APScheduler."""
    global _scheduler

    if _scheduler and _scheduler.running:
        logger.warning("Scheduler already running, skipping start")
        return

    _scheduler = AsyncIOScheduler(timezone="UTC")

    # Daily chronicle: every day at 09:00 UTC
    _scheduler.add_job(
        _daily_chronicle_wrapper,
        trigger=CronTrigger(hour=9, minute=0),
        id="daily_chronicle",
        name="Daily Chronicle Generator",
        replace_existing=True,
        max_instances=1,
        misfire_grace_time=3600,  # 1-hour grace window
    )

    # Weekly arc: every Sunday at 09:00 UTC
    _scheduler.add_job(
        _weekly_arc_wrapper,
        trigger=CronTrigger(day_of_week="sun", hour=9, minute=0),
        id="weekly_arc",
        name="Weekly Arc Generator",
        replace_existing=True,
        max_instances=1,
        misfire_grace_time=7200,
    )

    _scheduler.start()
    logger.info(
        "Scheduler started with %d jobs: %s",
        len(_scheduler.get_jobs()),
        [j.id for j in _scheduler.get_jobs()],
    )


def stop_scheduler() -> None:
    """Gracefully shut down the scheduler."""
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
    _scheduler = None


def get_scheduler() -> AsyncIOScheduler | None:
    """Return the current scheduler instance."""
    return _scheduler
