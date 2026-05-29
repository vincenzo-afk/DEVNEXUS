'use client';
import { useState } from 'react';
import MarkdownEditor from '@/components/notebook/MarkdownEditor';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: Date;
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Hackathon Project Ideas',
    content: '# Ideas\n\n1. AI Developer Assistant\n2. Real-time Collaboration Tool\n3. Smart TODO Engine',
    tags: ['brainstorming', 'hackathon'],
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Architecture Spec',
    content: '## Architecture\n\n- Frontend: Next.js + Tailwind\n- Backend: FastAPI + Python\n- Database: Supabase (PostgreSQL)',
    tags: ['architecture', 'spec'],
    updatedAt: new Date(Date.now() - 86400000),
  }
];

export default function NotebookPage() {
  const [activeNote, setActiveNote] = useState<Note | null>(mockNotes[0]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold flex items-center gap-2 shrink-0">
        <span>📓</span> Project Notebook
      </h1>
      
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-64 flex flex-col gap-4 shrink-0">
          <div className="glass-card flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border bg-card">
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                + New Note
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
              {mockNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={`p-3 text-left rounded-lg transition-all border ${activeNote?.id === note.id ? 'bg-primary/10 border-primary shadow-sm' : 'bg-transparent border-transparent hover:bg-input hover:border-border'}`}
                >
                  <div className="font-medium text-sm truncate">{note.title}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-background border border-border rounded text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0 h-full">
          {activeNote ? (
            <MarkdownEditor key={activeNote.id} note={activeNote} />
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center text-muted-foreground">
              <span className="text-4xl mb-4">💡</span>
              <p>Select a note or create a new one to start writing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
