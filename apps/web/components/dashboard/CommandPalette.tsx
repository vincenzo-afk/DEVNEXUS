'use client';
import { useEffect, useState } from 'react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="glass-card w-full max-w-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <input 
          autoFocus 
          placeholder="Type a command or search..." 
          className="w-full bg-transparent border-b border-border p-4 outline-none text-foreground"
        />
        <div className="p-2 h-64 overflow-y-auto">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Suggestions</div>
          <div className="px-3 py-2 text-sm text-foreground hover:bg-primary/20 rounded cursor-pointer">Go to GitHub</div>
          <div className="px-3 py-2 text-sm text-foreground hover:bg-primary/20 rounded cursor-pointer">Go to TODOs</div>
          <div className="px-3 py-2 text-sm text-foreground hover:bg-primary/20 rounded cursor-pointer">Generate Daily Chronicle</div>
        </div>
      </div>
    </div>
  );
}
