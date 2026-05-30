from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChronicleRequest(BaseModel):
    commits: List[str]
    todos: List[str]

class ChronicleResponse(BaseModel):
    chronicle: str

class PitchRequest(BaseModel):
    project_name: str
    description: str
    stack: List[str]

class PitchResponse(BaseModel):
    pitch: str

class JudgeRequest(BaseModel):
    project_idea: str

class ExpandIdeaRequest(BaseModel):
    idea: str

class ExpandIdeaResponse(BaseModel):
    expanded: str

# --- New Schemas ---

class MessageSchema(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[MessageSchema]

class SubtaskCreate(BaseModel):
    title: str

class SubtaskUpdate(BaseModel):
    completed: bool

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    due_date: Optional[str] = None
    is_recurring: Optional[bool] = False
    recurrence_type: Optional[str] = None
    tags: Optional[List[str]] = []

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_type: Optional[str] = None
    tags: Optional[List[str]] = None

class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = ""
    tags: Optional[List[str]] = []
    repo_link: Optional[str] = None
    is_pinned: Optional[bool] = False

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    repo_link: Optional[str] = None
    is_pinned: Optional[bool] = None

class HackathonCreate(BaseModel):
    name: str
    theme: Optional[str] = None
    deadline: str
    team_members: Optional[List[str]] = []
    tech_stack: Optional[List[str]] = []
    prize_pool: Optional[str] = None
    status: Optional[str] = "upcoming"
    notes: Optional[str] = None

class HackathonUpdate(BaseModel):
    name: Optional[str] = None
    theme: Optional[str] = None
    deadline: Optional[str] = None
    team_members: Optional[List[str]] = None
    tech_stack: Optional[List[str]] = None
    prize_pool: Optional[str] = None
    status: Optional[str] = None
    current_phase: Optional[int] = None
    pitch_generated: Optional[str] = None
    judge_score: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class ChecklistItemCreate(BaseModel):
    title: str
    phase: int

class ChecklistItemUpdate(BaseModel):
    completed: bool
