from fastapi import APIRouter
from models.schemas import ChronicleRequest, ChronicleResponse, PitchRequest, PitchResponse, JudgeRequest, ExpandIdeaRequest, ExpandIdeaResponse
from services import gemini_service

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/chronicle", response_model=ChronicleResponse)
async def create_chronicle(request: ChronicleRequest):
    chronicle = await gemini_service.generate_daily_chronicle(request.commits, request.todos)
    return ChronicleResponse(chronicle=chronicle)

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
