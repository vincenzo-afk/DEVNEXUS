'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Github, BookOpen, CheckSquare, Trophy, Activity, Settings, Moon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useThemeStore } from '@/stores/useThemeStore';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'GitHub', href: '/dashboard/github', icon: Github },
  { name: 'Notebook', href: '/dashboard/notebook', icon: BookOpen },
  { name: 'TODOs', href: '/dashboard/todos', icon: CheckSquare },
  { name: 'Hackathons', href: '/dashboard/hackathons', icon: Trophy },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    const themes: Array<'midnight' | 'cyberpunk' | 'forest' | 'arctic' | 'solarized'> = ['midnight', 'cyberpunk', 'forest', 'arctic', 'solarized'];
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <motion.aside
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      className="w-60 h-full border-r border-border flex flex-col justify-between"
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      <div className="p-4 flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
            ⚡
          </div>
          <span className="font-bold text-lg tracking-tight gradient-text">DevNexus</span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border flex flex-col gap-4">
        <div className="flex items-center justify-between px-2 text-muted-foreground">
          <button onClick={toggleTheme} className="hover:text-foreground transition-colors">
            <Moon size={18} />
          </button>
          <button className="hover:text-foreground transition-colors">
            <Settings size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 px-2">
          <Avatar className="w-8 h-8 border border-border">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{session?.user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">Creator</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
