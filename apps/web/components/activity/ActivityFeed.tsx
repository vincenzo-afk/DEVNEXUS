'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCommit, GitPullRequest, AlertCircle, Star, GitFork, Clock, ArrowUpRight } from 'lucide-react';
import { getActivity, syncActivity } from '@/lib/api-client';

export interface ActivityEvent {
  id: string;
  type: 'push' | 'pr' | 'issue' | 'star' | 'fork';
  description: string;
  repo: string;
  time: string;
  details?: string;
  actor: string;
  actorAvatar: string;
}

const config = {
  push: { icon: GitCommit, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  pr: { icon: GitPullRequest, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  issue: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  star: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  fork: { icon: GitFork, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
};

function formatRelativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

interface ActivityFeedProps {
  filterType: 'all' | 'push' | 'pr' | 'issue' | 'star';
  searchQuery?: string;
  refreshKey?: number;
}

export default function ActivityFeed({ filterType, searchQuery = '', refreshKey = 0 }: ActivityFeedProps) {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = session?.accessToken;
    if (status !== 'authenticated' || !token) {
      if (status !== 'loading') setLoading(false);
      return;
    }
    let mounted = true;
    async function loadEvents() {
      try {
        setError(null);
        await syncActivity(token);
        const data = await getActivity(token);
        if (mounted) setEvents(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load activity');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadEvents();
    const interval = window.setInterval(loadEvents, 60000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [session?.accessToken, status, refreshKey]);

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((n) => <div key={n} className="glass-card flex animate-pulse items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4"><div className="h-10 w-10 flex-shrink-0 rounded-xl bg-white/5" /><div className="flex-1 space-y-2 py-1"><div className="h-3.5 w-1/3 rounded bg-white/10" /><div className="h-4 w-3/4 rounded bg-white/15" /><div className="h-3 w-1/4 rounded bg-white/5" /></div></div>)}</div>;
  }

  if (error) {
    return <div className="glass-card space-y-2 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"><p className="font-semibold text-red-400">Activity sync failed</p><p className="text-sm leading-relaxed text-white/55">{error}</p></div>;
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredEvents = events.filter((event) => {
    const typeMatch = filterType === 'all' || event.type === filterType;
    const textMatch = !query || [event.description, event.repo, event.details, event.actor].some((value) => value?.toLowerCase().includes(query));
    return typeMatch && textMatch;
  });

  if (filteredEvents.length === 0) {
    return <div className="glass-card rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center text-muted-foreground">No matching activity found.</div>;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {filteredEvents.map((event) => {
          const cfg = config[event.type];
          const Icon = cfg.icon;
          return (
            <motion.div key={event.id} initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35 }} className="glass-card group relative flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04]">
              <div className={`mt-0.5 flex-shrink-0 rounded-xl border p-2.5 ${cfg.bg}`}><Icon className={`h-4 w-4 ${cfg.color}`} /></div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {event.actorAvatar && <img src={event.actorAvatar} alt={event.actor} className="h-5 w-5 rounded-full border border-white/10" />}
                    <span className="text-xs font-bold text-white">{event.actor}</span>
                    <span className="text-xs text-white/55">{event.description}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[10px] font-medium text-muted-foreground"><Clock className="h-3 w-3" />{formatRelativeTime(event.time)}</div>
                </div>
                {event.details && <p className="truncate text-sm font-semibold leading-relaxed text-white/80">{event.details}</p>}
                <div className="mt-1 flex items-center gap-2"><span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white/40">{event.repo}</span><a href={`https://github.com/${event.repo}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-[10px] font-semibold text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">View on GitHub <ArrowUpRight className="h-3 w-3" /></a></div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
