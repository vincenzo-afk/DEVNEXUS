export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function generateChronicle(commits: string[], todos: string[]) {
  const response = await fetch(`${API_URL}/ai/chronicle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commits, todos }),
  });
  if (!response.ok) throw new Error('Failed to generate chronicle');
  return response.json();
}

export async function generatePitch(projectName: string, description: string, stack: string[]) {
  const response = await fetch(`${API_URL}/ai/pitch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_name: projectName, description, stack }),
  });
  if (!response.ok) throw new Error('Failed to generate pitch');
  return response.json();
}

export async function simulateJudge(projectIdea: string) {
  const response = await fetch(`${API_URL}/ai/judge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_idea: projectIdea }),
  });
  if (!response.ok) throw new Error('Failed to simulate judge');
  return response.json();
}

export async function expandIdea(idea: string) {
  const response = await fetch(`${API_URL}/ai/expand-idea`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea }),
  });
  if (!response.ok) throw new Error('Failed to expand idea');
  return response.json();
}
