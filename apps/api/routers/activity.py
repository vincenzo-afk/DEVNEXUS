"""Persistent GitHub activity and notification endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from middleware.auth import get_current_user, get_github_token
from routers.utils import get_db_user_id, get_supabase
from services.github_service import execute_rest

router = APIRouter(tags=["Activity"])

SUPPORTED_EVENTS = {
    "PushEvent": "push",
    "PullRequestEvent": "pr",
    "IssuesEvent": "issue",
    "WatchEvent": "star",
    "ForkEvent": "fork",
}


def _event_description(item: dict[str, Any]) -> tuple[str, str]:
    payload = item.get("payload") or {}
    event_type = item.get("type")
    if event_type == "PushEvent":
        commits = payload.get("commits") or []
        branch = (payload.get("ref") or "refs/heads/main").replace("refs/heads/", "")
        count = len(commits) or 1
        details = commits[0].get("message", "") if commits else ""
        return f"Pushed {count} commit{'s' if count != 1 else ''} to {branch}", details
    if event_type == "PullRequestEvent":
        action = payload.get("action", "updated").capitalize()
        pull_request = payload.get("pull_request") or {}
        if action.lower() == "closed" and pull_request.get("merged"):
            action = "Merged"
        return f"{action} PR #{payload.get('number', '')}", pull_request.get("title", "")
    if event_type == "IssuesEvent":
        issue = payload.get("issue") or {}
        return f"{str(payload.get('action', 'updated')).capitalize()} issue #{issue.get('number', '')}", issue.get("title", "")
    if event_type == "WatchEvent":
        return "Starred repository", ""
    if event_type == "ForkEvent":
        return "Forked repository", ""
    return "GitHub activity", ""


def _to_row(item: dict[str, Any], user_id: str) -> dict[str, Any] | None:
    event_type = SUPPORTED_EVENTS.get(item.get("type"))
    repo_name = (item.get("repo") or {}).get("name")
    if not event_type or not repo_name or not item.get("id"):
        return None
    description, details = _event_description(item)
    actor = item.get("actor") or {}
    event_data = {
        "github_id": item["id"],
        "description": description,
        "details": details,
        "actor": actor.get("display_login") or actor.get("login") or "GitHub user",
        "actor_avatar": actor.get("avatar_url") or "",
        "created_at": item.get("created_at"),
    }
    return {
        "user_id": user_id,
        "event_type": event_type,
        "repo_name": repo_name,
        "event_data": event_data,
        "created_at": item.get("created_at"),
    }


def _notification_for(row: dict[str, Any]) -> dict[str, Any] | None:
    event_data = row["event_data"]
    event_type = row["event_type"]
    if event_type == "star":
        return {
            "type": "star",
            "title": "New repository star",
            "message": f"{event_data['actor']} starred {row['repo_name']}",
        }
    if event_type == "pr" and event_data["description"].startswith("Merged"):
        return {
            "type": "pr",
            "title": "Pull request merged",
            "message": f"{event_data['actor']} merged a pull request in {row['repo_name']}",
        }
    if event_type == "issue":
        return {
            "type": "critical" if "critical" in event_data["details"].lower() else "issue",
            "title": "Issue activity",
            "message": f"{event_data['description']} in {row['repo_name']}",
        }
    return None


def _map_event(row: dict[str, Any]) -> dict[str, Any]:
    data = row.get("event_data") or {}
    return {
        "id": row["id"],
        "type": row["event_type"],
        "description": data.get("description", "GitHub activity"),
        "repo": row.get("repo_name", ""),
        "time": row.get("created_at") or data.get("created_at"),
        "details": data.get("details", ""),
        "actor": data.get("actor", "GitHub user"),
        "actorAvatar": data.get("actor_avatar", ""),
    }


def _map_notification(row: dict[str, Any]) -> dict[str, Any]:
    icons = {"star": "★", "pr": "✓", "deadline": "!", "critical": "!", "issue": "!"}
    return {
        "id": row["id"],
        "type": row.get("type", "critical"),
        "icon": icons.get(row.get("type"), "•"),
        "title": row.get("title", "Notification"),
        "body": row.get("message", ""),
        "read": bool(row.get("read", False)),
        "timestamp": row.get("created_at"),
        "link": row.get("link"),
    }


@router.post("/activity/sync")
async def sync_activity(token: str = Depends(get_github_token), user: dict = Depends(get_current_user)):
    user_id = get_db_user_id(user)
    supabase = get_supabase()
    try:
        raw_events = await execute_rest(f"/users/{user['login']}/events", token, {"per_page": 100})
        existing = supabase.table("activity_events").select("event_data").eq("user_id", user_id).order("created_at", desc=True).limit(200).execute().data or []
        existing_ids = {(row.get("event_data") or {}).get("github_id") for row in existing}
        rows = []
        for item in raw_events if isinstance(raw_events, list) else []:
            row = _to_row(item, user_id)
            if row and row["event_data"]["github_id"] not in existing_ids:
                rows.append(row)
        if rows:
            inserted = supabase.table("activity_events").insert(rows).execute().data or []
            notifications = []
            for row in rows:
                notification = _notification_for(row)
                if notification:
                    notifications.append({
                        "user_id": user_id,
                        **notification,
                        "link": f"https://github.com/{row['repo_name']}",
                    })
            if notifications:
                supabase.table("notifications").insert(notifications).execute()
        return {"synced": len(rows)}
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="GitHub activity sync failed") from exc


@router.get("/activity")
async def get_activity(user: dict = Depends(get_current_user)):
    user_id = get_db_user_id(user)
    rows = get_supabase().table("activity_events").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(100).execute().data or []
    return [_map_event(row) for row in rows]


@router.get("/notifications")
async def get_notifications(user: dict = Depends(get_current_user)):
    user_id = get_db_user_id(user)
    rows = get_supabase().table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(30).execute().data or []
    return [_map_notification(row) for row in rows]


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: dict = Depends(get_current_user)):
    user_id = get_db_user_id(user)
    result = get_supabase().table("notifications").update({"read": True}).eq("id", notification_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return _map_notification(result.data[0])


@router.post("/notifications/read-all")
async def mark_all_notifications_read(user: dict = Depends(get_current_user)):
    user_id = get_db_user_id(user)
    get_supabase().table("notifications").update({"read": True}).eq("user_id", user_id).eq("read", False).execute()
    return {"status": "success"}


@router.delete("/notifications/{notification_id}")
async def dismiss_notification(notification_id: str, user: dict = Depends(get_current_user)):
    user_id = get_db_user_id(user)
    result = get_supabase().table("notifications").delete().eq("id", notification_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return {"status": "success"}
