'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ChevronRight, Search, Music } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getPageName = () => {
    if (pathname === '/dashboard') return 'Overview';
    const parts = pathname.split('/');
    const last = parts[parts.length - 1];
    if (last === 'github') return 'GitHub Center';
    if (last === 'notebook') return 'Project Notebook';
    if (last === 'todos') return 'Smart TODOs';
    if (last === 'hackathons') return 'Hackathons';
    if (last === 'activity') return 'Live Feed';
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border glass relative z-10">
      <div className="flex items-center text-sm text-muted-foreground">
        <span>Dashboard</span>
        <ChevronRight size={14} className="mx-2" />
        <span className="font-medium text-foreground">{getPageName()}</span>
      </div>

      <div className="flex-1 flex justify-center px-4">
        <button 
          className="flex items-center gap-2 px-4 py-1.5 w-64 bg-white/5 hover:bg-white/10 rounded-full text-xs text-muted-foreground border border-white/5 transition-colors"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
        >
          <Search size={13} />
          <span>Search or command...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono border border-white/10">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono border border-white/10">K</kbd>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => document.dispatchEvent(new CustomEvent('vibe:activate'))}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-white/5 rounded-lg border border-white/5"
          title="Toggle Vibe Mode"
        >
          <Music size={16} />
        </button>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-xs text-muted-foreground hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-white/5"
        >
          Sign Out
        </button>
        <Avatar className="w-8 h-8">
          <AvatarImage src={session?.user?.image || ''} />
          <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
