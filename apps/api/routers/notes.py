from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.schemas import NoteCreate, NoteUpdate
from middleware.auth import get_current_user
from routers.utils import get_supabase, get_db_user_id

router = APIRouter(prefix="/notes", tags=["Notes"])

def db_to_fe_note(db_note: dict) -> dict:
    return {
        "id": db_note["id"],
        "title": db_note["title"],
        "content": db_note.get("content", ""),
        "tags": db_note.get("tags", []),
        "repoLink": db_note.get("repo_link"),
        "isPinned": db_note.get("is_pinned", False),
        "wordCount": db_note.get("word_count", 0),
        "updatedAt": db_note.get("updated_at")
    }

@router.get("")
async def get_notes(user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    res = supabase.table("notes").select("*").eq("user_id", db_user_id).order("updated_at", desc=True).execute()
    return [db_to_fe_note(n) for n in (res.data or [])]

@router.post("")
async def create_note(note_data: NoteCreate, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    words = len(note_data.content.split()) if note_data.content else 0
    
    res = supabase.table("notes").insert({
        "user_id": db_user_id,
        "title": note_data.title,
        "content": note_data.content,
        "tags": note_data.tags,
        "repo_link": note_data.repo_link,
        "is_pinned": note_data.is_pinned,
        "word_count": words
    }).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create note")
        
    return db_to_fe_note(res.data[0])

@router.put("/{note_id}")
async def update_note(note_id: str, note_data: NoteUpdate, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # 1. Fetch existing note to verify ownership & compare content
    existing = supabase.table("notes").select("*").eq("id", note_id).eq("user_id", db_user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Note not found")
        
    old_note = existing.data[0]
    old_content = old_note.get("content", "")
    
    update_payload = {}
    content_changed = False
    
    if note_data.title is not None:
        update_payload["title"] = note_data.title
    if note_data.content is not None:
        update_payload["content"] = note_data.content
        update_payload["word_count"] = len(note_data.content.split())
        if note_data.content != old_content:
            content_changed = True
    if note_data.tags is not None:
        update_payload["tags"] = note_data.tags
    if note_data.repo_link is not None:
        update_payload["repo_link"] = note_data.repo_link
    if note_data.is_pinned is not None:
        update_payload["is_pinned"] = note_data.is_pinned
        
    # 2. Update Note
    res = supabase.table("notes").update(update_payload).eq("id", note_id).execute()
    
    # 3. Create Note Version History if content changed
    if content_changed:
        # Get next version number
        versions = supabase.table("note_versions").select("version_number").eq("note_id", note_id).execute()
        v_num = 1
        if versions.data:
            v_num = max(v["version_number"] for v in versions.data) + 1
            
        supabase.table("note_versions").insert({
            "note_id": note_id,
            "content": old_content,
            "version_number": v_num
        }).execute()
        
    return db_to_fe_note(res.data[0])

@router.get("/{note_id}/versions")
async def get_note_versions(note_id: str, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Verify ownership of note
    note = supabase.table("notes").select("id").eq("id", note_id).eq("user_id", db_user_id).execute()
    if not note.data:
        raise HTTPException(status_code=404, detail="Note not found")
        
    res = supabase.table("note_versions").select("*").eq("note_id", note_id).order("version_number", desc=True).execute()
    return res.data or []

@router.post("/{note_id}/restore/{version_id}")
async def restore_note_version(note_id: str, version_id: str, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Verify ownership
    note = supabase.table("notes").select("*").eq("id", note_id).eq("user_id", db_user_id).execute()
    if not note.data:
        raise HTTPException(status_code=404, detail="Note not found")
        
    # Get version content
    version = supabase.table("note_versions").select("*").eq("id", version_id).eq("note_id", note_id).execute()
    if not version.data:
        raise HTTPException(status_code=404, detail="Version not found")
        
    v_data = version.data[0]
    old_content_before_restore = note.data[0]["content"]
    
    # Update note to version content
    res = supabase.table("notes").update({
        "content": v_data["content"],
        "word_count": len(v_data["content"].split())
    }).eq("id", note_id).execute()
    
    # Create new version representing the state before restoring
    versions = supabase.table("note_versions").select("version_number").eq("note_id", note_id).execute()
    v_num = max((v["version_number"] for v in versions.data), default=0) + 1
    
    supabase.table("note_versions").insert({
        "note_id": note_id,
        "content": old_content_before_restore,
        "version_number": v_num
    }).execute()
    
    return db_to_fe_note(res.data[0])

@router.delete("/{note_id}")
async def delete_note(note_id: str, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Verify ownership
    existing = supabase.table("notes").select("id").eq("id", note_id).eq("user_id", db_user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Note not found")
        
    supabase.table("notes").delete().eq("id", note_id).execute()
    return {"status": "success"}
