'use client';

import { ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border glass relative z-10">
      <div className="flex items-center text-sm text-muted-foreground">
        <span>Dashboard</span>
        <ChevronRight size={14} className="mx-2" />
        <span className="font-medium text-foreground">Live Feed</span>
      </div>

      <div className="flex items-center gap-4">
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
