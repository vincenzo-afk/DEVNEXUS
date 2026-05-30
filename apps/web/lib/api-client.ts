export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// AI endpoints
export async function generateChronicle(token: string) {
  const response = await fetch(`${API_URL}/ai/chronicle`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to generate chronicle');
  return response.json();
}

export async function getLatestChronicle(token: string) {
  const response = await fetch(`${API_URL}/ai/chronicle`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch latest chronicle');
  return response.json();
}

export async function generatePitch(projectName: string, description: string, stack: string[], token?: string) {
  const response = await fetch(`${API_URL}/ai/pitch`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ project_name: projectName, description, stack }),
  });
  if (!response.ok) throw new Error('Failed to generate pitch');
  return response.json();
}

export async function simulateJudge(projectIdea: string, token?: string) {
  const response = await fetch(`${API_URL}/ai/judge`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ project_idea: projectIdea }),
  });
  if (!response.ok) throw new Error('Failed to simulate judge');
  return response.json();
}

export async function expandIdea(idea: string, token?: string) {
  const response = await fetch(`${API_URL}/ai/expand-idea`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ idea }),
  });
  if (!response.ok) throw new Error('Failed to expand idea');
  return response.json();
}

export async function sendChatToNexus(messages: { role: string; content: string }[], token?: string) {
  const response = await fetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) throw new Error('Failed to chat with Nexus');
  return response.json();
}

// TODOs endpoints
export async function getTodos(token: string) {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch todos');
  return response.json();
}

export async function createTodo(
  todo: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string | null;
    is_recurring?: boolean;
    recurrence_type?: string | null;
    tags?: string[];
  },
  token: string
) {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(todo),
  });
  if (!response.ok) throw new Error('Failed to create todo');
  return response.json();
}

export async function updateTodo(
  todoId: string,
  todo: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string | null;
    is_recurring?: boolean;
    recurrence_type?: string | null;
    tags?: string[];
  },
  token: string
) {
  const response = await fetch(`${API_URL}/todos/${todoId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(todo),
  });
  if (!response.ok) throw new Error('Failed to update todo');
  return response.json();
}

export async function deleteTodo(todoId: string, token: string) {
  const response = await fetch(`${API_URL}/todos/${todoId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to delete todo');
  return response.json();
}

export async function createSubtask(todoId: string, subtask: { title: string }, token: string) {
  const response = await fetch(`${API_URL}/todos/${todoId}/subtasks`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(subtask),
  });
  if (!response.ok) throw new Error('Failed to create subtask');
  return response.json();
}

export async function updateSubtask(todoId: string, subtaskId: string, subtask: { completed: boolean }, token: string) {
  const response = await fetch(`${API_URL}/todos/${todoId}/subtasks/${subtaskId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(subtask),
  });
  if (!response.ok) throw new Error('Failed to update subtask');
  return response.json();
}

// Notes endpoints
export async function getNotes(token: string) {
  const response = await fetch(`${API_URL}/notes`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}

export async function createNote(
  note: {
    title: string;
    content?: string;
    tags?: string[];
    repo_link?: string | null;
    is_pinned?: boolean;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
}

export async function updateNote(
  noteId: string,
  note: {
    title?: string;
    content?: string;
    tags?: string[];
    repo_link?: string | null;
    is_pinned?: boolean;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/notes/${noteId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error('Failed to update note');
  return response.json();
}

export async function deleteNote(noteId: string, token: string) {
  const response = await fetch(`${API_URL}/notes/${noteId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to delete note');
  return response.json();
}

export async function getNoteVersions(noteId: string, token: string) {
  const response = await fetch(`${API_URL}/notes/${noteId}/versions`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch note versions');
  return response.json();
}

export async function restoreNoteVersion(noteId: string, versionId: string, token: string) {
  const response = await fetch(`${API_URL}/notes/${noteId}/restore/${versionId}`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to restore note version');
  return response.json();
}

// Hackathons endpoints
export async function getHackathons(token: string) {
  const response = await fetch(`${API_URL}/hackathons`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch hackathons');
  return response.json();
}

export async function createHackathon(
  hackathon: {
    name: string;
    theme?: string;
    deadline: string;
    team_members?: string[];
    tech_stack?: string[];
    prize_pool?: string;
    status?: string;
    notes?: string;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/hackathons`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(hackathon),
  });
  if (!response.ok) throw new Error('Failed to create hackathon');
  return response.json();
}

export async function updateHackathon(
  hackathonId: string,
  hackathon: {
    name?: string;
    theme?: string;
    deadline?: string;
    team_members?: string[];
    tech_stack?: string[];
    prize_pool?: string;
    status?: string;
    current_phase?: number;
    pitch_generated?: string | null;
    judge_score?: any;
    notes?: string;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/hackathons/${hackathonId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(hackathon),
  });
  if (!response.ok) throw new Error('Failed to update hackathon');
  return response.json();
}

export async function deleteHackathon(hackathonId: string, token: string) {
  const response = await fetch(`${API_URL}/hackathons/${hackathonId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to delete hackathon');
  return response.json();
}

export async function updateChecklistItem(hackathonId: string, itemId: string, completed: boolean, token: string) {
  const response = await fetch(`${API_URL}/hackathons/${hackathonId}/checklist/${itemId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) throw new Error('Failed to update checklist item');
  return response.json();
}

// GitHub endpoints
export async function getGitHubRepos(token: string) {
  const response = await fetch(`${API_URL}/github/repos`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch github repositories');
  return response.json();
}

export async function getGitHubStats(token: string) {
  const response = await fetch(`${API_URL}/github/stats`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch github stats');
  return response.json();
}

export async function getGitHubForecast(token: string) {
  const response = await fetch(`${API_URL}/github/forecast`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch github forecast');
  return response.json();
}
