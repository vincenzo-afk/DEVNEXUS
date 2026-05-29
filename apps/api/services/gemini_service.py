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

async def generate_daily_chronicle(commits: List[str], todos: List[str]) -> str:
    prompt = f"""
    You are an AI narrator for a developer.
    Here are their commits from yesterday:
    {commits}
    
    Here are their top TODOs for today:
    {todos}
    
    Write a short, engaging, and slightly witty daily chronicle (max 3 paragraphs) 
    summarizing their progress and motivating them for the day ahead.
    """
    model = get_model()
    response = model.generate_content(prompt)
    return response.text

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
