'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Compass, Sparkles, Music, Layout, Github, BookOpen, CheckSquare, Trophy, Activity } from 'lucide-react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commands = [
    { name: 'Go to Overview', path: '/dashboard', icon: Layout },
    { name: 'Go to GitHub Center', path: '/dashboard/github', icon: Github },
    { name: 'Go to Project Notebook', path: '/dashboard/notebook', icon: BookOpen },
    { name: 'Go to Smart TODOs', path: '/dashboard/todos', icon: CheckSquare },
    { name: 'Go to Hackathons', path: '/dashboard/hackathons', icon: Trophy },
    { name: 'Go to Live Feed', path: '/dashboard/activity', icon: Activity },
    { name: 'Open Nexus AI sidebar', action: () => document.dispatchEvent(new CustomEvent('nexus:open')), icon: Sparkles },
    { name: 'Activate Vibe Mode', action: () => document.dispatchEvent(new CustomEvent('vibe:activate')), icon: Music },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd: typeof commands[0]) => {
    if (cmd.path) {
      router.push(cmd.path);
    } else if (cmd.action) {
      cmd.action();
    }
    setOpen(false);
    setQuery('');
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-md transition-all"
      onClick={() => { setOpen(false); setQuery(''); }}
    >
      <div 
        className="glass-card w-full max-w-xl shadow-2xl flex flex-col border border-white/10 bg-[hsl(var(--sidebar-bg,220_15%_8%))] rounded-2xl overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-white/10">
          <Search className="w-4 h-4 text-muted-foreground mr-3" />
          <input 
            autoFocus 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search page..." 
            className="w-full bg-transparent py-4 outline-none text-foreground text-sm"
          />
        </div>
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> Navigation & Commands
          </div>
          {filteredCommands.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No commands found matching "{query}"</p>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.name}
                  onClick={() => handleSelect(cmd)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all text-left"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span>{cmd.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
