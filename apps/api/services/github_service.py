"""
DevNexus – GitHub GraphQL API Service
Provides async helpers for fetching user stats, repos, contributions,
trending repositories, and commit forecasts.
"""

from __future__ import annotations

import logging
import math
from datetime import date, timedelta
from typing import Any, Optional

import httpx

logger = logging.getLogger("devnexus.github")

GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"
GITHUB_REST_BASE = "https://api.github.com"
GITHUB_TRENDING_URL = "https://api.gitterapp.com/repositories"  # public scraper

# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------


async def execute_graphql(
    query: str,
    variables: dict[str, Any],
    token: str,
) -> dict[str, Any]:
    """Execute a GitHub GraphQL query and return the 'data' key."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            GITHUB_GRAPHQL_URL,
            json={"query": query, "variables": variables},
            headers=headers,
        )
        response.raise_for_status()
        body = response.json()
        if "errors" in body:
            logger.warning("GraphQL errors: %s", body["errors"])
        return body.get("data", {})


async def execute_rest(
    path: str,
    token: str,
    params: Optional[dict[str, Any]] = None,
) -> Any:
    """Execute a GitHub REST API call."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(
            f"{GITHUB_REST_BASE}{path}",
            headers=headers,
            params=params or {},
        )
        response.raise_for_status()
        return response.json()


# ---------------------------------------------------------------------------
# User stats
# ---------------------------------------------------------------------------

_USER_STATS_QUERY = """
query GetUserStats($login: String!) {
  user(login: $login) {
    login
    name
    avatarUrl
    bio
    followers { totalCount }
    following { totalCount }
    repositories(first: 100, ownerAffiliations: [OWNER], privacy: PUBLIC) {
      totalCount
      nodes {
        stargazerCount
        forkCount
        primaryLanguage { name }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalRepositoryContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            contributionLevel
          }
        }
      }
    }
  }
}
"""


async def get_user_stats(username: str, token: str) -> dict[str, Any]:
    """Fetch aggregated user statistics from GitHub GraphQL API."""
    data = await execute_graphql(_USER_STATS_QUERY, {"login": username}, token)
    user = data.get("user") or {}

    repos = user.get("repositories", {}).get("nodes", [])
    total_stars = sum(r.get("stargazerCount", 0) for r in repos)
    total_forks = sum(r.get("forkCount", 0) for r in repos)

    # Language frequency map
    lang_counts: dict[str, int] = {}
    for repo in repos:
        lang = (repo.get("primaryLanguage") or {}).get("name")
        if lang:
            lang_counts[lang] = lang_counts.get(lang, 0) + 1

    top_languages = dict(
        sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)[:8]
    )

    # Streak calculation
    contrib_days: list[dict] = []
    for week in (
        user.get("contributionsCollection", {})
        .get("contributionCalendar", {})
        .get("weeks", [])
    ):
        contrib_days.extend(week.get("contributionDays", []))

    current_streak = 0
    longest_streak = 0
    running = 0
    for day in reversed(contrib_days):
        if day.get("contributionCount", 0) > 0:
            running += 1
            longest_streak = max(longest_streak, running)
            if current_streak == running - 1:
                current_streak = running
        else:
            if current_streak == 0:
                current_streak = 0
            running = 0

    contrib_collection = user.get("contributionsCollection", {})
    total_contributions = (
        contrib_collection.get("contributionCalendar", {}).get(
            "totalContributions", 0
        )
    )

    return {
        "username": user.get("login", username),
        "name": user.get("name"),
        "avatar_url": user.get("avatarUrl"),
        "bio": user.get("bio"),
        "followers": user.get("followers", {}).get("totalCount", 0),
        "following": user.get("following", {}).get("totalCount", 0),
        "public_repos": user.get("repositories", {}).get("totalCount", 0),
        "total_stars": total_stars,
        "total_forks": total_forks,
        "total_contributions": total_contributions,
        "top_languages": top_languages,
        "contribution_streak": current_streak,
        "longest_streak": longest_streak,
    }


# ---------------------------------------------------------------------------
# Contribution calendar
# ---------------------------------------------------------------------------

_CONTRIBUTION_QUERY = """
query GetContributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}
"""

_LEVEL_MAP = {
    "NONE": 0,
    "FIRST_QUARTILE": 1,
    "SECOND_QUARTILE": 2,
    "THIRD_QUARTILE": 3,
    "FOURTH_QUARTILE": 4,
}


async def get_contribution_calendar(username: str, token: str) -> dict[str, Any]:
    """Fetch the full year contribution calendar."""
    today = date.today()
    from_dt = (today - timedelta(days=364)).isoformat() + "T00:00:00Z"
    to_dt = today.isoformat() + "T23:59:59Z"

    data = await execute_graphql(
        _CONTRIBUTION_QUERY,
        {"login": username, "from": from_dt, "to": to_dt},
        token,
    )

    calendar = (
        data.get("user", {})
        .get("contributionsCollection", {})
        .get("contributionCalendar", {})
    )

    weeks = []
    for week in calendar.get("weeks", []):
        days = [
            {
                "date": d["date"],
                "count": d["contributionCount"],
                "level": _LEVEL_MAP.get(d.get("contributionLevel", "NONE"), 0),
            }
            for d in week.get("contributionDays", [])
        ]
        weeks.append({"days": days})

    return {
        "total_contributions": calendar.get("totalContributions", 0),
        "weeks": weeks,
    }


# ---------------------------------------------------------------------------
# Repositories
# ---------------------------------------------------------------------------

_REPOS_QUERY = """
query GetRepos($login: String!, $after: String) {
  user(login: $login) {
    repositories(
      first: 50,
      after: $after,
      ownerAffiliations: [OWNER],
      orderBy: { field: PUSHED_AT, direction: DESC }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        name
        nameWithOwner
        description
        url
        primaryLanguage { name }
        stargazerCount
        forkCount
        openIssues: issues(states: [OPEN]) { totalCount }
        isPrivate
        pushedAt
        createdAt
        repositoryTopics(first: 10) {
          nodes { topic { name } }
        }
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 1) { nodes { message } }
            }
          }
        }
        object(expression: "HEAD:README.md") { id }
        object2: object(expression: "HEAD:.github/workflows") { id }
      }
    }
  }
}
"""


def calculate_health_score(repo: dict[str, Any]) -> int:
    """
    Compute a 0–100 health score for a repository based on:
    - Has README (+25)
    - Has CI workflows (+20)
    - Has description (+15)
    - Recent push < 30 days (+15)
    - Open issues < 10 (+15)
    - Has topics (+10)
    """
    score = 0

    if repo.get("object"):  # README exists
        score += 25
    if repo.get("object2"):  # .github/workflows exists
        score += 20
    if repo.get("description"):
        score += 15

    pushed_at = repo.get("pushedAt", "")
    if pushed_at:
        try:
            pushed_date = date.fromisoformat(pushed_at[:10])
            days_since_push = (date.today() - pushed_date).days
            if days_since_push < 30:
                score += 15
            elif days_since_push < 90:
                score += 8
        except ValueError:
            pass

    open_issues = repo.get("openIssues", {}).get("totalCount", 0)
    if open_issues < 5:
        score += 15
    elif open_issues < 20:
        score += 8

    topics = repo.get("repositoryTopics", {}).get("nodes", [])
    if topics:
        score += 10

    return min(score, 100)


async def get_repos(username: str, token: str) -> list[dict[str, Any]]:
    """Fetch all public repos for a user with health scores."""
    repos = []
    after = None

    for _ in range(10):  # max 500 repos
        data = await execute_graphql(
            _REPOS_QUERY, {"login": username, "after": after}, token
        )
        repo_data = data.get("user", {}).get("repositories", {})
        nodes = repo_data.get("nodes", [])

        for node in nodes:
            topics = [
                t["topic"]["name"]
                for t in node.get("repositoryTopics", {}).get("nodes", [])
            ]
            repos.append(
                {
                    "id": node.get("id", ""),
                    "name": node.get("name", ""),
                    "full_name": node.get("nameWithOwner", ""),
                    "description": node.get("description"),
                    "url": node.get("url", ""),
                    "language": (node.get("primaryLanguage") or {}).get("name"),
                    "stars": node.get("stargazerCount", 0),
                    "forks": node.get("forkCount", 0),
                    "open_issues": node.get("openIssues", {}).get("totalCount", 0),
                    "is_private": node.get("isPrivate", False),
                    "pushed_at": node.get("pushedAt"),
                    "created_at": node.get("createdAt"),
                    "topics": topics,
                    "health_score": calculate_health_score(node),
                }
            )

        page_info = repo_data.get("pageInfo", {})
        if not page_info.get("hasNextPage"):
            break
        after = page_info.get("endCursor")

    return repos


# ---------------------------------------------------------------------------
# Trending repos
# ---------------------------------------------------------------------------


async def get_trending_repos(
    language: Optional[str] = None,
    since: str = "daily",
) -> list[dict[str, Any]]:
    """
    Fetch trending repositories from the GitHub trending API.
    Falls back to GitHub search API if the scraper is unavailable.
    """
    try:
        params: dict[str, Any] = {"since": since}
        if language:
            params["language"] = language

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(GITHUB_TRENDING_URL, params=params)
            if resp.status_code == 200:
                raw = resp.json()
                return [
                    {
                        "name": r.get("name", ""),
                        "full_name": r.get("full_name", r.get("name", "")),
                        "description": r.get("description"),
                        "url": r.get("url", ""),
                        "language": r.get("language"),
                        "stars": r.get("stars", 0),
                        "forks": r.get("forks", 0),
                        "stars_today": r.get("currentPeriodStars"),
                    }
                    for r in raw[:20]
                ]
    except Exception as exc:
        logger.warning("Trending scraper failed, falling back to search: %s", exc)

    # Fallback: GitHub search API (no token needed for basic search)
    query = "stars:>500 pushed:>2024-01-01"
    if language:
        query += f" language:{language}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{GITHUB_REST_BASE}/search/repositories",
            params={"q": query, "sort": "stars", "order": "desc", "per_page": 20},
            headers={"Accept": "application/vnd.github.v3+json"},
        )
        resp.raise_for_status()
        items = resp.json().get("items", [])

    return [
        {
            "name": r.get("name", ""),
            "full_name": r.get("full_name", ""),
            "description": r.get("description"),
            "url": r.get("html_url", ""),
            "language": r.get("language"),
            "stars": r.get("stargazers_count", 0),
            "forks": r.get("forks_count", 0),
            "stars_today": None,
        }
        for r in items
    ]


# ---------------------------------------------------------------------------
# Commit forecast
# ---------------------------------------------------------------------------


def forecast_commits(contribution_history: list[dict[str, Any]]) -> list[dict]:
    """
    ML-lite commit forecast using day-of-week averages.
    Returns 7-day forecast with predicted counts and confidence.
    """
    from collections import defaultdict

    day_totals: dict[int, list[int]] = defaultdict(list)
    for entry in contribution_history:
        try:
            d = date.fromisoformat(entry["date"])
            day_totals[d.weekday()].append(entry.get("count", 0))
        except (KeyError, ValueError):
            continue

    day_averages: dict[int, float] = {}
    for weekday, counts in day_totals.items():
        day_averages[weekday] = sum(counts) / len(counts) if counts else 0.0

    global_avg = sum(day_averages.values()) / max(len(day_averages), 1)

    forecast = []
    today = date.today()
    for i in range(1, 8):
        future_date = today + timedelta(days=i)
        weekday = future_date.weekday()
        predicted = day_averages.get(weekday, global_avg)

        # Confidence based on sample size
        sample_size = len(day_totals.get(weekday, []))
        confidence = min(0.9, 0.3 + (sample_size / 52) * 0.6)

        forecast.append(
            {
                "date": future_date.isoformat(),
                "predicted_commits": round(predicted, 2),
                "confidence": round(confidence, 2),
            }
        )

    return forecast
