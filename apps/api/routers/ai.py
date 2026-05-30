import json
import google.generativeai as genai
from fastapi import APIRouter, Depends, Request
from models.schemas import (
    ChronicleRequest, ChronicleResponse, PitchRequest, PitchResponse,
    JudgeRequest, ExpandIdeaRequest, ExpandIdeaResponse, ChatRequest
)
from services import gemini_service
from middleware.auth import get_current_user
from routers.utils import get_supabase, get_db_user_id

router = APIRouter(prefix="/ai", tags=["AI"])

@router.get("/chronicle")
async def get_latest_chronicle(user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    res = supabase.table("chronicles").select("*").eq("user_id", db_user_id).eq("type", "daily").order("date", desc=True).limit(1).execute()
    if res.data:
        c = res.data[0]
        try:
            content = json.loads(c["content"])
        except Exception:
            content = {"headline": "Daily Log", "narrative": c["content"], "mood": "focused"}
        return {
            "id": c["id"],
            "date": str(c["date"]),
            "headline": content.get("headline", "Daily Log"),
            "narrative": content.get("narrative", ""),
            "mood": content.get("mood", "focused")
        }
    return None

@router.post("/chronicle")
async def trigger_chronicle_generation(user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    from services.narrator_service import generate_daily_chronicle_job
    await generate_daily_chronicle_job(db_user_id)
    
    supabase = get_supabase()
    res = supabase.table("chronicles").select("*").eq("user_id", db_user_id).eq("type", "daily").order("date", desc=True).limit(1).execute()
    if res.data:
        c = res.data[0]
        try:
            content = json.loads(c["content"])
        except Exception:
            content = {"headline": "Daily Log", "narrative": c["content"], "mood": "focused"}
        return {
            "id": c["id"],
            "date": str(c["date"]),
            "headline": content.get("headline", "Daily Log"),
            "narrative": content.get("narrative", ""),
            "mood": content.get("mood", "focused")
        }
    return {
        "headline": "No Chronicle Generated",
        "narrative": "No tasks completed or commits made today. Start coding or complete a TODO to generate your narrative!",
        "mood": "chill"
    }

@router.post("/pitch", response_model=PitchResponse)
async def create_pitch(request: PitchRequest):
    pitch = await gemini_service.generate_pitch(request.project_name, request.description, request.stack)
    return PitchResponse(pitch=pitch)

@router.post("/judge")
async def create_judge_simulation(request: JudgeRequest):
    result = await gemini_service.simulate_judge(request.project_idea)
    return result

@router.post("/expand-idea", response_model=ExpandIdeaResponse)
async def expand_idea(request: ExpandIdeaRequest):
    expanded = await gemini_service.expand_idea(request.idea)
    return ExpandIdeaResponse(expanded=expanded)

@router.post("/chat")
async def chat_nexus(request: ChatRequest, user: dict = Depends(get_current_user)):
    db_user_id = get_db_user_id(user)
    supabase = get_supabase()
    
    # Fetch user context for Gemini context-awareness
    todos = supabase.table("todos").select("title, status").eq("user_id", db_user_id).execute().data
    notes = supabase.table("notes").select("title").eq("user_id", db_user_id).execute().data
    hackathons = supabase.table("hackathons").select("name, deadline").eq("user_id", db_user_id).execute().data
    
    todos_str = ", ".join([f"{t['title']} ({t['status']})" for t in (todos or [])]) or "None"
    notes_str = ", ".join([n['title'] for n in (notes or [])]) or "None"
    hacks_str = ", ".join([f"{h['name']} (Deadline: {h['deadline']})" for h in (hackathons or [])]) or "None"
    
    system_prompt = f"""
    You are NEXUS, an intelligent, developer-focused, and slightly witty AI developer companion.
    You live in the user's DevNexus Creator Command Center.
    Here is the developer's current context:
    - GitHub login: {user['login']}
    - Current Todos: {todos_str}
    - Current Notes: {notes_str}
    - Current Hackathons: {hacks_str}
    
    Give concise, helpful, and technical advice. Keep responses friendly, conversational, and markdown-friendly.
    """
    
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_prompt
    )
    
    chat = model.start_chat(history=[])
    # The last message content
    user_query = request.messages[-1].content
    response = chat.send_message(user_query)
    
    return {"response": response.text}
