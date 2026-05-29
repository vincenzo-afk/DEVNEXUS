'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCommit, GitPullRequest, AlertCircle, Star, GitFork, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export interface ActivityEvent {
  id: string;
  type: 'push' | 'pr' | 'issue' | 'star' | 'fork' | 'milestone';
  description: string;
  repo: string;
  time: string;
  details?: string;
  actor: string;
  actorAvatar: string;
}

const INITIAL_EVENTS: ActivityEvent[] = [
  {
    id: 'e1',
    type: 'push',
    description: 'Pushed 3 commits to branch main',
    repo: 'devnexus-frontend',
    time: '2 mins ago',
    details: 'feat(auth): enable credentials skip button for local demo mode',
    actor: 'vincenzo-afk',
    actorAvatar: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  {
    id: 'e2',
    type: 'pr',
    description: 'Merged Pull Request #42: Add Recharts dashboards',
    repo: 'devnexus-frontend',
    time: '1 hour ago',
    details: 'Implements commit forecast and repository health scores.',
    actor: 'vincenzo-afk',
    actorAvatar: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  {
    id: 'e3',
    type: 'star',
    description: 'Starred your repository',
    repo: 'devnexus-backend',
    time: '3 hours ago',
    actor: 'google-gemini-bot',
    actorAvatar: 'https://avatars.githubusercontent.com/u/108535261?v=4',
  },
  {
    id: 'e4',
    type: 'issue',
    description: 'Opened Issue #18: Fix service worker refresh cache on iOS Safari',
    repo: 'hacker-tools-cli',
    time: '5 hours ago',
    details: 'Service worker fails to update cache resources under poor network conditions.',
    actor: 'hacker-reviewer',
    actorAvatar: 'https://avatars.githubusercontent.com/u/1285352?v=4',
  },
  {
    id: 'e5',
    type: 'fork',
    description: 'Forked your repository',
    repo: 'devnexus-frontend',
    time: 'Yesterday',
    actor: 'indie-developer-zero',
    actorAvatar: 'https://avatars.githubusercontent.com/u/238531?v=4',
  },
  {
    id: 'e6',
    type: 'milestone',
    description: 'Completed Milestone: Phase 2 AI & UI core integration',
    repo: 'devnexus',
    time: 'Yesterday',
    details: 'All core backend services and layout pages integrated.',
    actor: 'vincenzo-afk',
    actorAvatar: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
];

const NEW_EVENT_POOL: Omit<ActivityEvent, 'id' | 'time'>[] = [
  {
    type: 'push',
    description: 'Pushed 1 commit to main',
    repo: 'devnexus-backend',
    details: 'fix(ai-judge): resolve floating point score precision parser',
    actor: 'vincenzo-afk',
    actorAvatar: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  {
    type: 'star',
    description: 'Starred your repository',
    repo: 'devnexus-frontend',
    actor: 'hacker-news-reviewer',
    actorAvatar: 'https://avatars.githubusercontent.com/u/148532?v=4',
  },
  {
    type: 'issue',
    description: 'Closed Issue #14: Implement custom theme context provider',
    repo: 'devnexus-frontend',
    details: 'Resolved by writing ThemeProvider using localTheme data attribute.',
    actor: 'vincenzo-afk',
    actorAvatar: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  {
    type: 'pr',
    description: 'Opened Pull Request #43: Edge caching route optimizing',
    repo: 'smart-todo-scheduler',
    details: 'Drafting middleware to cache prioritized tasks in cloudflare KV.',
    actor: 'go-scheduler-bot',
    actorAvatar: 'https://avatars.githubusercontent.com/u/108535?v=4',
  },
];

const config = {
  push: { icon: GitCommit, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  pr: { icon: GitPullRequest, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  issue: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  star: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  fork: { icon: GitFork, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  milestone: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

interface ActivityFeedProps {
  filterType: 'all' | 'push' | 'pr' | 'issue' | 'star';
}

export default function ActivityFeed({ filterType }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    // Simulate real-time websocket feed
    const interval = setInterval(() => {
      const poolIndex = Math.floor(Math.random() * NEW_EVENT_POOL.length);
      const template = NEW_EVENT_POOL[poolIndex];
      const newEvent: ActivityEvent = {
        ...template,
        id: 'e-' + Date.now(),
        time: 'Just now',
      };
      setEvents((prev) => [newEvent, ...prev.map(e => e.time === 'Just now' ? { ...e, time: '1 min ago' } : e)].slice(0, 15));
    }, 12000); // Trigger event every 12 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {filteredEvents.map((event) => {
          const cfg = config[event.type] || config.push;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="glass-card p-4 rounded-2xl border border-white/8 hover:border-white/15 bg-white/2 hover:bg-white/4 transition-all duration-300 flex items-start gap-4 relative group"
            >
              {/* Event Icon container */}
              <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <img
                      src={event.actorAvatar}
                      alt={event.actor}
                      className="w-5 h-5 rounded-full border border-white/10"
                    />
                    <span className="text-xs font-bold text-white hover:text-indigo-400 cursor-pointer">
                      {event.actor}
                    </span>
                    <span className="text-xs text-white/55">
                      {event.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium font-mono whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </div>
                </div>

                {event.details && (
                  <p className="text-sm font-semibold text-white/80 leading-relaxed truncate">
                    {event.details}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 font-mono tracking-wider">
                    {event.repo}
                  </span>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View commit <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
