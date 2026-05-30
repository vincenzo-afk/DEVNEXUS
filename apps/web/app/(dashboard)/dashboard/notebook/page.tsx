'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BookOpen, Loader2, AlertCircle, Plus, Search } from 'lucide-react';
import MarkdownEditor, { Note } from '@/components/notebook/MarkdownEditor';
import { getNotes, createNote, updateNote, deleteNote } from '@/lib/api-client';

export default function NotebookPage() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllNotes = async (token: string, selectId?: string) => {
    try {
      setLoading(true);
      const list = await getNotes(token);
      setNotes(list);
      
      // If we have a preferred note ID to select, do it, otherwise select the first
      if (selectId) {
        const found = list.find((n: Note) => n.id === selectId);
        setActiveNote(found || list[0] || null);
      } else if (list.length > 0) {
        setActiveNote(list[0]);
      } else {
        setActiveNote(null);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch notebook notes. Make sure backend services are online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchAllNotes(session.accessToken);
    }
  }, [session?.accessToken]);

  const handleCreateNote = async () => {
    if (!session?.accessToken) return;
    try {
      const newN = await createNote(
        {
          title: 'New Project Note',
          content: '# New Project Note\n\nWrite something down...',
          tags: ['general'],
        },
        session.accessToken
      );
      
      // Refresh and select the newly created note
      await fetchAllNotes(session.accessToken, newN.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async (
    noteId: string,
    updatedFields: { title: string; content: string; tags: string[] }
  ) => {
    if (!session?.accessToken) return;
    try {
      const saved = await updateNote(
        noteId,
        {
          title: updatedFields.title,
          content: updatedFields.content,
          tags: updatedFields.tags,
        },
        session.accessToken
      );
      
      // Map back to notes state
      setNotes((prev) => prev.map((n) => (n.id === noteId ? saved : n)));
      setActiveNote(saved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!session?.accessToken) return;
    if (!confirm('Are you sure you want to delete this note? This action is permanent.')) return;
    try {
      await deleteNote(noteId, session.accessToken);
      // Re-fetch notes
      await fetchAllNotes(session.accessToken);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!session?.accessToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-muted-foreground text-sm">Authenticating session...</p>
      </div>
    );
  }

  if (loading && notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-indigo-400 text-sm font-semibold animate-pulse">Syncing notes database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 max-w-md mx-auto text-center mt-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Notebook Load Error</h3>
        <p className="text-sm text-white/60 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            <BookOpen className="w-8 h-8 text-indigo-400" />
            Project Notebook
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Capture specifications, brainstorm architecture designs, and save ideas with Gemini version control.
          </p>
        </div>
      </div>

      {/* Main layout: Sidebar and Editor */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Notes list sidebar */}
        <div className="w-72 flex flex-col gap-4 shrink-0 h-full">
          <div className="glass-card flex flex-col h-full overflow-hidden bg-white/3 border border-white/10 rounded-2xl">
            {/* Search */}
            <div className="p-3 border-b border-white/10 relative">
              <input
                type="text"
                placeholder="Search notes & tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-white/30 absolute left-6 top-5.5" />
            </div>

            {/* Create Button */}
            <div className="p-3 border-b border-white/10">
              <button
                onClick={handleCreateNote}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                New Note
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No notes found.</p>
              ) : (
                filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNote(note)}
                    className={`w-full p-3 text-left rounded-xl transition-all border ${
                      activeNote?.id === note.id
                        ? 'bg-indigo-600/10 border-indigo-500/35 shadow-lg'
                        : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white truncate mb-1">{note.title}</div>
                    <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed mb-2 font-mono">
                      {note.content.replace(/[#*`\-_[\]]/g, '')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/8 rounded text-white/55"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Note Editor Area */}
        <div className="flex-1 min-w-0 h-full">
          {activeNote ? (
            <MarkdownEditor
              key={activeNote.id}
              note={activeNote}
              token={session.accessToken}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center text-muted-foreground bg-white/3 border border-white/10 rounded-2xl">
              <BookOpen className="w-12 h-12 text-white/20 mb-4 animate-pulse" />
              <p className="text-sm font-semibold">Select a note or create a new one to start writing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
