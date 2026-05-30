from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.schemas import HackathonCreate, HackathonUpdate, ChecklistItemUpdate
from middleware.auth import get_current_user
from routers.utils import get_supabase, get_db_user_id

router = APIRouter(prefix="/hackathons", tags=["Hackathons"])

def db_to_fe_hackathon(db_hack: dict, checklist_items: list = None) -> dict:
    fe_checklist = []
    if checklist_items:
        for item in checklist_items:
            fe_checklist.append({
                "id": item["id"],
                "phase": item["phase"],
                "title": item["title"],
                "completed": item.get("completed", False)
            })
            
    return {
        "id": db_hack["id"],
        "name": db_hack["name"],
        "theme": db_hack.get("theme", ""),
        "prizePool": db_hack.get("prize_pool", ""),
        "deadline": db_hack["deadline"],
        "status": db_hack.get("status", "upcoming"),
        "teamMembers": [{"name": m, "avatar": m[0] if m else "U"} for m in db_hack.get("team_members", [])],
        "techStack": db_hack.get("tech_stack", []),
        "currentPhase": db_hack.get("current_phase", 0),
        "description": db_hack.get("notes", ""),
        "pitchGenerated": db_hack.get("pitch_generated"),
        "judgeScore": db_hack.get("judge_score"),
        "checklist": fe_checklist
    }

# Standard default checklist tasks per phase (Ideation -> Build -> Polish -> Submit)
DEFAULT_TASKS = [
    # Phase 0: Ideation
    {"phase": 0, "title": "Brainstorm project ideas", "position": 0},
    {"phase": 0, "title": "Define target audience & impact", "position": 1},
    {"phase": 0, "title": "Select core technology stack", "position": 2},
    
    # Phase 1: Build
    {"phase": 1, "title": "Setup development repository", "position": 0},
    {"phase": 1, "title": "Design core database schema", "position": 1},
    {"phase": 1, "title": "Build layout & navigation", "position": 2},
    {"phase": 1, "title": "Integrate APIs & mock services", "position": 3},
    
    # Phase 2: Polish
    {"phase": 2, "title": "Perform end-to-end user tests", "position": 0},
    {"phase": 2, "title": "Enhance UX transition animations", "position": 1},
    {"phase": 2, "title": "Resolve critical UI console bugs", "position": 2},
    
    # Phase 3: Submit
    {"phase": 3, "title": "Record demo walkthrough video", "position": 0},
    {"phase": 3, "title": "Complete submission platform details", "position": 1},
    {"phase": 3, "title": "Generate presentation pitch slides", "position": 2},
]

@router.get("")
async def get_hackathons(user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    res = supabase.table("hackathons").select("*").eq("user_id", db_user_id).order("deadline", desc=False).execute()
    hacks = res.data or []
    
    hack_ids = [h["id"] for h in hacks]
    checklist = []
    if hack_ids:
        checklist_res = supabase.table("hackathon_checklist_items").select("*").in_("hackathon_id", hack_ids).order("position", desc=False).execute()
        checklist = checklist_res.data or []
        
    checklist_by_hack = {}
    for item in checklist:
        h_id = item["hackathon_id"]
        if h_id not in checklist_by_hack:
            checklist_by_hack[h_id] = []
        checklist_by_hack[h_id].append(item)
        
    return [db_to_fe_hackathon(h, checklist_by_hack.get(h["id"], [])) for h in hacks]

@router.post("")
async def create_hackathon(hack_data: HackathonCreate, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Insert hackathon
    res = supabase.table("hackathons").insert({
        "user_id": db_user_id,
        "name": hack_data.name,
        "theme": hack_data.theme,
        "deadline": hack_data.deadline,
        "team_members": hack_data.team_members,
        "tech_stack": hack_data.tech_stack,
        "prize_pool": hack_data.prize_pool,
        "status": hack_data.status,
        "notes": hack_data.notes
    }).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to register hackathon")
        
    hack = res.data[0]
    
    # Insert default checklist items
    items_data = [
        {
            "hackathon_id": hack["id"],
            "phase": task["phase"],
            "title": task["title"],
            "position": task["position"],
            "completed": False
        }
        for task in DEFAULT_TASKS
    ]
    
    checklist_res = supabase.table("hackathon_checklist_items").insert(items_data).execute()
    inserted_checklist = checklist_res.data or []
    
    return db_to_fe_hackathon(hack, inserted_checklist)

@router.put("/{hackathon_id}")
async def update_hackathon(hackathon_id: str, hack_data: HackathonUpdate, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Verify ownership
    existing = supabase.table("hackathons").select("id").eq("id", hackathon_id).eq("user_id", db_user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Hackathon not found")
        
    update_payload = {}
    if hack_data.name is not None:
        update_payload["name"] = hack_data.name
    if hack_data.theme is not None:
        update_payload["theme"] = hack_data.theme
    if hack_data.deadline is not None:
        update_payload["deadline"] = hack_data.deadline
    if hack_data.team_members is not None:
        update_payload["team_members"] = hack_data.team_members
    if hack_data.tech_stack is not None:
        update_payload["tech_stack"] = hack_data.tech_stack
    if hack_data.prize_pool is not None:
        update_payload["prize_pool"] = hack_data.prize_pool
    if hack_data.status is not None:
        update_payload["status"] = hack_data.status
    if hack_data.current_phase is not None:
        update_payload["current_phase"] = hack_data.current_phase
    if hack_data.pitch_generated is not None:
        update_payload["pitch_generated"] = hack_data.pitch_generated
    if hack_data.judge_score is not None:
        import json
        update_payload["judge_score"] = hack_data.judge_score
    if hack_data.notes is not None:
        update_payload["notes"] = hack_data.notes
        
    res = supabase.table("hackathons").update(update_payload).eq("id", hackathon_id).execute()
    
    # Fetch checklist items
    checklist_res = supabase.table("hackathon_checklist_items").select("*").eq("hackathon_id", hackathon_id).order("position", desc=False).execute()
    
    return db_to_fe_hackathon(res.data[0], checklist_res.data or [])

@router.delete("/{hackathon_id}")
async def delete_hackathon(hackathon_id: str, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Verify ownership
    existing = supabase.table("hackathons").select("id").eq("id", hackathon_id).eq("user_id", db_user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Hackathon not found")
        
    supabase.table("hackathons").delete().eq("id", hackathon_id).execute()
    return {"status": "success"}

@router.put("/{hackathon_id}/checklist/{item_id}")
async def update_checklist_item(hackathon_id: str, item_id: str, item_data: ChecklistItemUpdate, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Verify ownership of parent hackathon
    existing = supabase.table("hackathons").select("id").eq("id", hackathon_id).eq("user_id", db_user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Hackathon not found")
        
    res = supabase.table("hackathon_checklist_items").update({
        "completed": item_data.completed
    }).eq("id", item_id).eq("hackathon_id", hackathon_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Checklist item not found")
        
    return res.data[0]
