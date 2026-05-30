from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.schemas import TodoCreate, TodoUpdate, SubtaskCreate, SubtaskUpdate
from middleware.auth import get_current_user
from routers.utils import get_supabase, get_db_user_id
from services import gemini_service

router = APIRouter(prefix="/todos", tags=["Todos"])

def db_to_fe_todo(db_todo: dict, subtasks: list = None) -> dict:
    # Map database structure to frontend structure
    status = db_todo.get("status", "todo")
    if status == "in-progress":
        status = "inprogress"
    
    priority = db_todo.get("priority", "medium")
    priority = priority.capitalize()  # 'high' -> 'High', etc.
    
    fe_subtasks = []
    if subtasks:
        for s in subtasks:
            fe_subtasks.append({
                "id": s["id"],
                "title": s["title"],
                "done": s.get("completed", False)
            })
            
    return {
        "id": db_todo["id"],
        "title": db_todo["title"],
        "description": db_todo.get("description"),
        "status": status,
        "priority": priority,
        "dueDate": db_todo.get("due_date"),
        "aiScore": db_todo.get("ai_score", 50),
        "isRecurring": db_todo.get("is_recurring", False),
        "recurrenceType": db_todo.get("recurrence_type"),
        "streak": db_todo.get("streak", 0),
        "tags": db_todo.get("tags", []),
        "done": db_todo.get("status") == "done",
        "subtasks": fe_subtasks
    }

def fe_to_db_status(fe_status: str) -> str:
    if fe_status == "inprogress":
        return "in-progress"
    return fe_status

def fe_to_db_priority(fe_priority: str) -> str:
    return fe_priority.lower()

@router.get("")
async def get_todos(user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Fetch todos
    todos_res = supabase.table("todos").select("*").eq("user_id", db_user_id).execute()
    todos = todos_res.data or []
    
    # Fetch all subtasks for this user's todos
    todo_ids = [t["id"] for t in todos]
    subtasks = []
    if todo_ids:
        subtasks_res = supabase.table("subtasks").select("*").in_("todo_id", todo_ids).execute()
        subtasks = subtasks_res.data or []
        
    # Group subtasks by todo_id
    subtasks_by_todo = {}
    for s in subtasks:
        t_id = s["todo_id"]
        if t_id not in subtasks_by_todo:
            subtasks_by_todo[t_id] = []
        subtasks_by_todo[t_id].append(s)
        
    return [db_to_fe_todo(t, subtasks_by_todo.get(t["id"], [])) for t in todos]

@router.post("")
async def create_todo(todo_data: TodoCreate, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # 1. Run Gemini auto-prioritization score
    ai_score = await gemini_service.score_todo(todo_data.title, todo_data.description or "")
    
    db_status = fe_to_db_status(todo_data.status)
    db_priority = fe_to_db_priority(todo_data.priority)
    
    # 2. Insert Todo
    todo_res = supabase.table("todos").insert({
        "user_id": db_user_id,
        "title": todo_data.title,
        "description": todo_data.description,
        "status": db_status,
        "priority": db_priority,
        "ai_score": ai_score,
        "due_date": todo_data.due_date,
        "is_recurring": todo_data.is_recurring,
        "recurrence_type": todo_data.recurrence_type,
        "tags": todo_data.tags
    }).execute()
    
    if not todo_res.data:
        raise HTTPException(status_code=500, detail="Failed to create todo")
    
    new_todo = todo_res.data[0]
    
    # 3. Auto-generate subtasks using Gemini
    subtask_titles = await gemini_service.generate_subtasks(todo_data.title)
    inserted_subtasks = []
    if subtask_titles:
        subtasks_data = [
            {"todo_id": new_todo["id"], "title": title, "completed": False, "position": idx}
            for idx, title in enumerate(subtask_titles)
        ]
        subtask_res = supabase.table("subtasks").insert(subtasks_data).execute()
        inserted_subtasks = subtask_res.data or []
        
    return db_to_fe_todo(new_todo, inserted_subtasks)

@router.put("/{todo_id}")
async def update_todo(todo_id: str, todo_data: TodoUpdate, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Verify ownership
    existing = supabase.table("todos").select("id").eq("id", todo_id).eq("user_id", db_user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Todo not found")
        
    update_payload = {}
    if todo_data.title is not None:
        update_payload["title"] = todo_data.title
    if todo_data.description is not None:
        update_payload["description"] = todo_data.description
    if todo_data.status is not None:
        update_payload["status"] = fe_to_db_status(todo_data.status)
    if todo_data.priority is not None:
        update_payload["priority"] = fe_to_db_priority(todo_data.priority)
    if todo_data.due_date is not None:
        update_payload["due_date"] = todo_data.due_date
    if todo_data.is_recurring is not None:
        update_payload["is_recurring"] = todo_data.is_recurring
    if todo_data.recurrence_type is not None:
        update_payload["recurrence_type"] = todo_data.recurrence_type
    if todo_data.tags is not None:
        update_payload["tags"] = todo_data.tags
        
    res = supabase.table("todos").update(update_payload).eq("id", todo_id).execute()
    
    # Fetch subtasks
    subtasks_res = supabase.table("subtasks").select("*").eq("todo_id", todo_id).execute()
    
    return db_to_fe_todo(res.data[0], subtasks_res.data or [])

@router.delete("/{todo_id}")
async def delete_todo(todo_id: str, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Verify ownership
    existing = supabase.table("todos").select("id").eq("id", todo_id).eq("user_id", db_user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Todo not found")
        
    supabase.table("todos").delete().eq("id", todo_id).execute()
    return {"status": "success"}

@router.post("/{todo_id}/subtasks")
async def create_subtask(todo_id: str, subtask_data: SubtaskCreate, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Verify ownership of parent todo
    existing = supabase.table("todos").select("id").eq("id", todo_id).eq("user_id", db_user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Todo not found")
        
    res = supabase.table("subtasks").insert({
        "todo_id": todo_id,
        "title": subtask_data.title,
        "completed": False
    }).execute()
    
    sub = res.data[0]
    return {"id": sub["id"], "title": sub["title"], "done": sub["completed"]}

@router.put("/{todo_id}/subtasks/{subtask_id}")
async def update_subtask(todo_id: str, subtask_id: str, subtask_data: SubtaskUpdate, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Verify ownership of parent todo
    existing = supabase.table("todos").select("id").eq("id", todo_id).eq("user_id", db_user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Todo not found")
        
    res = supabase.table("subtasks").update({
        "completed": subtask_data.completed
    }).eq("id", subtask_id).eq("todo_id", todo_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Subtask not found")
        
    sub = res.data[0]
    return {"id": sub["id"], "title": sub["title"], "done": sub["completed"]}
