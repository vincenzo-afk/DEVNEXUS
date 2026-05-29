from pydantic import BaseModel
from typing import List, Optional

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
