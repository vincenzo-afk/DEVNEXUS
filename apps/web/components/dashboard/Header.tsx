'use client';

import { Bell, Music, Search, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(3);

  const getPageName = () => {
    if (pathname === '/dashboard') return 'Overview';
    const parts = pathname.split('/');
    const last = parts[parts.length - 1];
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
          className="flex items-center gap-2 px-4 py-1.5 w-64 bg-input/50 hover:bg-input rounded-full text-sm text-muted-foreground border border-border/50 transition-colors"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        >
          <Search size={14} />
          <span>Search or command...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-background text-[10px] font-mono border border-border">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-background text-[10px] font-mono border border-border">K</kbd>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <Music size={18} />
        </button>
        
        <button className="text-muted-foreground hover:text-foreground transition-colors relative group">
          <Bell size={18} className={unreadCount > 0 ? "group-hover:animate-bounce-soft" : ""} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground font-bold">
              {unreadCount}
            </span>
          )}
        </button>
        
        <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
          <AvatarImage src={session?.user?.image || ''} />
          <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
