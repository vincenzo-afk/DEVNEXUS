'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, Code, Link, List, Save, Sparkles, History, Trash2, ArrowLeft } from 'lucide-react';
import { expandIdea, getNoteVersions, restoreNoteVersion } from '@/lib/api-client';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  repoLink?: string | null;
  isPinned?: boolean;
  wordCount?: number;
  updatedAt?: string;
}

interface MarkdownEditorProps {
  note: Note;
  token: string;
  onSave: (noteId: string, updatedFields: { title: string; content: string; tags: string[] }) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}

export default function MarkdownEditor({ note, token, onSave, onDelete }: MarkdownEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagsStr, setTagsStr] = useState(note.tags.join(', '));
  const [showIdeaExpander, setShowIdeaExpander] = useState(false);
  const [idea, setIdea] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTagsStr(note.tags.join(', '));
    setShowHistory(false);
  }, [note]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const tags = tagsStr.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
      await onSave(note.id, { title, content, tags });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExpandIdea = async () => {
    setIsExpanding(true);
    try {
      const response = await expandIdea(idea, token);
      setContent((prev) => prev + `\n\n## Expanded Idea: ${idea}\n\n${response.expanded}`);
    } catch (error) {
      console.error(error);
      setContent((prev) => prev + `\n\n## Expanded Idea\n\nFailed to expand idea. Make sure the API server is running.`);
    } finally {
      setIsExpanding(false);
      setShowIdeaExpander(false);
      setIdea('');
    }
  };

  const fetchVersions = async () => {
    setLoadingVersions(true);
    try {
      const list = await getNoteVersions(note.id, token);
      setVersions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVersions(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      fetchVersions();
    }
  }, [showHistory]);

  const handleRestoreVersion = async (versionId: string) => {
    try {
      const updatedNote = await restoreNoteVersion(note.id, versionId, token);
      setContent(updatedNote.content);
      setTitle(updatedNote.title);
      setTagsStr(updatedNote.tags.join(', '));
      setShowHistory(false);
      await fetchVersions();
    } catch (error) {
      console.error(error);
    }
  };

  const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;

  return (
    <div className="flex flex-col h-full glass-card overflow-hidden bg-white/3 border border-white/10 rounded-2xl relative">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/2 backdrop-blur-md shrink-0 gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-white font-bold text-base border-b border-transparent focus:border-indigo-500/50 outline-none px-1 py-0.5 w-48 focus:w-64 transition-all duration-300 mr-2"
            placeholder="Untitled Note"
          />
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors" title="Bold"><Bold size={15} /></button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors" title="Italic"><Italic size={15} /></button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors" title="Code"><Code size={15} /></button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors" title="Link"><Link size={15} /></button>
          <button className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors" title="List"><List size={15} /></button>
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showIdeaExpander ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20'
            }`}
            onClick={() => setShowIdeaExpander(!showIdeaExpander)}
          >
            <Sparkles size={13} /> Idea Expander
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all ${showHistory ? 'bg-white/10 text-white' : ''}`}
            title="Version History"
          >
            <History size={16} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
            title="Delete Note"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg transition-all disabled:opacity-50"
          >
            <Save size={13} /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Idea Expander Form */}
      {showIdeaExpander && (
        <div className="p-4 bg-indigo-500/5 border-b border-white/10 flex items-center gap-3 shrink-0">
          <input
            type="text"
            placeholder="Type a core thought or one-liner to expand..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            disabled={isExpanding}
          />
          <button
            onClick={handleExpandIdea}
            disabled={!idea.trim() || isExpanding}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Sparkles size={13} /> {isExpanding ? 'Expanding...' : 'Expand with Gemini'}
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* TextArea editor */}
          <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 p-4 overflow-y-auto">
            <textarea
              className="w-full h-full bg-transparent resize-none outline-none text-white/80 font-mono text-sm leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start drafting in Markdown..."
            />
          </div>
          
          {/* Live Markdown Preview */}
          <div className="flex-1 p-6 overflow-y-auto prose prose-invert max-w-none bg-white/1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || '*Markdown preview will render live here...*'}
            </ReactMarkdown>
          </div>
        </div>

        {/* Versions sidebar */}
        {showHistory && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900/95 border-l border-white/10 backdrop-blur-xl z-20 flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                <History className="w-4 h-4 text-indigo-400" />
                Version History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/55 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingVersions ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 animate-spin rounded-full" />
                </div>
              ) : versions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No previous versions found.</p>
              ) : (
                versions.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-white/5 border border-white/8 rounded-xl hover:border-indigo-500/35 transition-all text-xs"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-white">Version #{v.version_number}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(v.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-white/50 line-clamp-2 mt-1 mb-2 font-mono text-[10px]">
                      {v.content}
                    </p>
                    <button
                      onClick={() => handleRestoreVersion(v.id)}
                      className="w-full py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-600/30 hover:border-transparent rounded-lg text-[10px] font-bold transition-all"
                    >
                      Restore this Version
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer / Info panel */}
      <div className="p-3 border-t border-white/10 bg-white/2 backdrop-blur-md flex items-center justify-between text-xs text-muted-foreground px-4 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40">Tags:</span>
          <input
            type="text"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="ideas, code, planning"
            className="bg-transparent text-white border-b border-transparent focus:border-indigo-500/30 outline-none w-36 text-right text-xs"
          />
        </div>
      </div>
    </div>
  );
}
