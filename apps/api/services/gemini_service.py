import os
import google.generativeai as genai
from typing import List, Dict, Any

# Ensure the key is set (in a real app, use a configuration manager)
api_key = os.getenv("GEMINI_API_KEY", "AIzaSyBM2E1XBPpgAZBpIhbPx0WOubFnYUsHlHs")
genai.configure(api_key=api_key)

# We use gemini-1.5-pro or flash depending on needs
MODEL_NAME = "gemini-1.5-flash"

def get_model():
    return genai.GenerativeModel(MODEL_NAME)

async def generate_daily_chronicle(
    commits: List[str],
    todos: List[str],
    notes: List[str] = None,
    target_date: str = None,
) -> Dict[str, Any]:
    notes_str = f"\nKey Highlights/Notes: {notes}" if notes else ""
    prompt = f"""
    You are an AI narrator for a developer command center. 
    Yesterday's Commits: {commits}
    Today's TODOs: {todos}{notes_str}
    
    Write a short, engaging, and slightly witty daily chronicle summarizing progress and outlook.
    Provide the response as JSON exactly in this format without markdown codeblocks:
    {{
      "headline": "A catchy, fun headline.",
      "narrative": "A short, witty paragraph or two summarizing the developer's progress.",
      "mood": "Productive / Chill / Chaotic / Focused"
    }}
    """
    model = get_model()
    response = model.generate_content(prompt)
    import json
    try:
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception:
        return {
            "headline": "Code, Eat, Sleep, Repeat",
            "narrative": response.text.strip(),
            "mood": "Focused"
        }

async def generate_weekly_arc(
    week_start: str,
    commits: List[str],
    todos_completed: List[str],
    hackathons: List[str],
    highlights: List[str],
) -> Dict[str, Any]:
    prompt = f"""
    Analyze the developer's weekly activity starting {week_start}:
    Commits: {commits}
    Todos Completed: {todos_completed}
    Hackathons Active: {hackathons}
    Key Highlights/Notes: {highlights}
    
    Generate a weekly developer "story arc" summarizing their journey.
    Provide a JSON response exactly in this format without markdown codeblocks:
    {{
      "title": "Weekly Arc Title",
      "narrative": "A high-level paragraph summarizing their weekly arc.",
      "chapters": [
        "Chapter 1 description...",
        "Chapter 2 description..."
      ],
      "epilogue": "A brief, motivating epilogue paragraph.",
      "xp_earned": 150,
      "badges": ["Streak Master", "Code Warrior"]
    }}
    """
    model = get_model()
    response = model.generate_content(prompt)
    import json
    try:
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception:
        return {
            "title": "A Week of Build",
            "narrative": response.text.strip(),
            "chapters": ["Shipped features"],
            "epilogue": "Keep pushing forward.",
            "xp_earned": 100,
            "badges": ["Constructor"]
        }

async def score_todo(title: str, description: str = "") -> int:
    prompt = f"""
    You are an AI task prioritizer. Score the following task from 1 to 100 based on its importance, urgency, and developmental impact.
    Task: {title}
    Description: {description}
    
    Output ONLY the integer score (e.g., 85), nothing else. No explanation.
    """
    model = get_model()
    response = model.generate_content(prompt)
    try:
        return int(response.text.strip())
    except Exception:
        return 50

async def generate_subtasks(title: str) -> List[str]:
    prompt = f"""
    You are a technical lead. Generate 3 to 5 clear, actionable subtasks for this task: "{title}"
    
    Output ONLY a JSON list of strings, nothing else. No markdown block. Example:
    ["Subtask 1", "Subtask 2"]
    """
    model = get_model()
    response = model.generate_content(prompt)
    import json
    try:
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception:
        return []

async def generate_pitch(project_name: str, description: str, stack: List[str]) -> str:
    prompt = f"""
    You are an expert startup pitch coach. 
    Write a 3-minute hackathon pitch for the following project:
    Name: {project_name}
    Description: {description}
    Tech Stack: {', '.join(stack)}
    
    Include the following sections:
    1. The Hook
    2. The Problem
    3. The Solution & Tech
    4. The Impact
    5. The Closing
    """
    model = get_model()
    response = model.generate_content(prompt)
    return response.text

async def simulate_judge(project_idea: str) -> Dict[str, Any]:
    prompt = f"""
    You are a strict but fair hackathon judge. Evaluate this project idea out of 100 points.
    Project Idea: {project_idea}
    
    Output JSON exactly in this format without markdown codeblocks:
    {{
      "innovation": {{ "score": 20, "feedback": "..." }},
      "execution": {{ "score": 20, "feedback": "..." }},
      "impact": {{ "score": 20, "feedback": "..." }},
      "presentation": {{ "score": 20, "feedback": "..." }},
      "total": 80,
      "grade": "B"
    }}
    Scores are out of 25 for each category. Grade is A, B, C, or D.
    """
    model = get_model()
    response = model.generate_content(prompt)
    
    import json
    try:
        # Simple cleanup if there are markdown fences
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        return {
            "error": "Failed to parse judge response",
            "raw": response.text
        }

async def expand_idea(idea: str) -> str:
    prompt = f"""
    You are an expert software architect and product manager.
    A developer has given you a one-liner idea: "{idea}"
    
    Please expand it into a short, structured pitch or feature spec.
    Use Markdown (bullet points, bold text). Keep it under 200 words.
    """
    model = get_model()
    response = model.generate_content(prompt)
    return response.text

