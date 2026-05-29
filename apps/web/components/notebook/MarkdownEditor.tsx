'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Note } from '@/app/(dashboard)/dashboard/notebook/page';
import { Bold, Italic, Code, Link, List, Save, Sparkles } from 'lucide-react';

interface MarkdownEditorProps {
  note: Note;
}

export default function MarkdownEditor({ note }: MarkdownEditorProps) {
  const [content, setContent] = useState(note.content);
  const [showIdeaExpander, setShowIdeaExpander] = useState(false);
  const [idea, setIdea] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);

  const handleExpandIdea = async () => {
    setIsExpanding(true);
    try {
      const { expandIdea } = await import('@/lib/api-client');
      const response = await expandIdea(idea);
      setContent((prev) => prev + `\n\n## Expanded Idea\n\n${response.expanded}`);
    } catch (error) {
      console.error(error);
      setContent((prev) => prev + `\n\n## Expanded Idea\n\nFailed to expand idea. Make sure the API server is running.`);
    } finally {
      setIsExpanding(false);
      setShowIdeaExpander(false);
      setIdea('');
    }
  };

  return (
    <div className="flex flex-col h-full glass-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-input rounded text-muted-foreground hover:text-foreground transition-colors"><Bold size={16} /></button>
          <button className="p-2 hover:bg-input rounded text-muted-foreground hover:text-foreground transition-colors"><Italic size={16} /></button>
          <button className="p-2 hover:bg-input rounded text-muted-foreground hover:text-foreground transition-colors"><Code size={16} /></button>
          <button className="p-2 hover:bg-input rounded text-muted-foreground hover:text-foreground transition-colors"><Link size={16} /></button>
          <button className="p-2 hover:bg-input rounded text-muted-foreground hover:text-foreground transition-colors"><List size={16} /></button>
          <div className="w-px h-6 bg-border mx-2"></div>
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${showIdeaExpander ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
            onClick={() => setShowIdeaExpander(!showIdeaExpander)}
          >
            <Sparkles size={14} /> Idea Expander
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Saved 2m ago</span>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-input hover:bg-border rounded-md text-xs font-medium transition-colors">
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      {showIdeaExpander && (
        <div className="p-4 bg-primary/5 border-b border-border flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Type a one-liner to expand..." 
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
            disabled={isExpanding}
          />
          <button 
            onClick={handleExpandIdea}
            disabled={!idea.trim() || isExpanding}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {isExpanding ? 'Expanding...' : 'Expand with Gemini'}
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 border-r border-border p-4">
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none text-foreground font-mono text-sm leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
          />
        </div>
        <div className="flex-1 p-6 overflow-y-auto prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || '*Preview will appear here*'}
          </ReactMarkdown>
        </div>
      </div>
      
      <div className="p-2 border-t border-border bg-card flex items-center justify-between text-xs text-muted-foreground px-4">
        <div className="flex items-center gap-4">
          <span>{content.split(/\s+/).filter(w => w.length > 0).length} words</span>
          <span>~{Math.max(1, Math.ceil(content.split(/\s+/).filter(w => w.length > 0).length / 200))} min read</span>
        </div>
        <div className="flex items-center gap-1">
          {note.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-input rounded-full">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
