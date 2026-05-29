'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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

const config = {
  push: { icon: GitCommit, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  pr: { icon: GitPullRequest, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  issue: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  star: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  fork: { icon: GitFork, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  milestone: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

interface ActivityFeedProps {
  filterType: 'all' | 'push' | 'pr' | 'issue' | 'star';
}

export default function ActivityFeed({ filterType }: ActivityFeedProps) {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = session?.accessToken;
    if (status !== 'authenticated' || !token) {
      if (status !== 'loading') {
        setLoading(false);
      }
      return;
    }

    let isMounted = true;

    async function loadEvents() {
      try {
        setError(null);
        // 1. Get username (login)
        let username = session?.user?.username;
        if (!username) {
          const userRes = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            username = userData.login;
          }
        }

        if (!username) {
          throw new Error('Could not retrieve GitHub username');
        }

        // 2. Fetch events
        const eventsRes = await fetch(`https://api.github.com/users/${username}/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });

        if (!eventsRes.ok) {
          throw new Error(`Failed to fetch events: ${eventsRes.statusText}`);
        }

        const rawEvents = await eventsRes.json();
        if (!Array.isArray(rawEvents)) {
          throw new Error('Invalid events format received from GitHub');
        }

        const mapped: ActivityEvent[] = rawEvents
          .map((item: any) => {
            let type: ActivityEvent['type'] = 'milestone';
            if (item.type === 'PushEvent') type = 'push';
            else if (item.type === 'PullRequestEvent') type = 'pr';
            else if (item.type === 'IssuesEvent') type = 'issue';
            else if (item.type === 'WatchEvent') type = 'star';
            else if (item.type === 'ForkEvent') type = 'fork';
            else if (item.type === 'CreateEvent') type = 'milestone';

            let description = '';
            let details = '';

            if (item.type === 'PushEvent') {
              const count = item.payload.commits ? item.payload.commits.length : 1;
              const branch = item.payload.ref ? item.payload.ref.replace('refs/heads/', '') : 'main';
              description = `Pushed ${count} commit${count > 1 ? 's' : ''} to branch ${branch}`;
              details = item.payload.commits && item.payload.commits[0] ? item.payload.commits[0].message : '';
            } else if (item.type === 'PullRequestEvent') {
              const action = item.payload.action;
              const isMerged = item.payload.pull_request?.merged;
              description = `${isMerged ? 'Merged' : action.charAt(0).toUpperCase() + action.slice(1)} PR #${item.payload.number}`;
              details = item.payload.pull_request ? item.payload.pull_request.title : '';
            } else if (item.type === 'IssuesEvent') {
              const action = item.payload.action;
              description = `${action.charAt(0).toUpperCase() + action.slice(1)} Issue #${item.payload.issue?.number}`;
              details = item.payload.issue ? item.payload.issue.title : '';
            } else if (item.type === 'WatchEvent') {
              description = 'Starred repository';
            } else if (item.type === 'ForkEvent') {
              description = 'Forked repository';
            } else if (item.type === 'CreateEvent') {
              description = `Created ${item.payload.ref_type} ${item.payload.ref || ''}`;
            } else {
              description = `${item.type.replace('Event', '')} activity`;
            }

            return {
              id: item.id,
              type,
              description,
              repo: item.repo.name,
              time: formatRelativeTime(item.created_at),
              details,
              actor: item.actor.display_login || item.actor.login,
              actorAvatar: item.actor.avatar_url
            };
          });

        if (isMounted) {
          setEvents(mapped);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'An error occurred while loading GitHub events');
          setLoading(false);
        }
      }
    }

    loadEvents();

    // Poll every 60 seconds
    const interval = setInterval(loadEvents, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [session, status]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="glass-card p-4 rounded-2xl border border-white/5 bg-white/2 animate-pulse flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3.5 bg-white/10 rounded w-1/3" />
              <div className="h-4 bg-white/15 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center space-y-2">
        <p className="text-red-400 font-semibold">⚠️ Load Failed</p>
        <p className="text-sm text-white/55 leading-relaxed">{error}</p>
      </div>
    );
  }

  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  if (filteredEvents.length === 0) {
    return (
      <div className="glass-card p-12 rounded-2xl border border-white/5 bg-white/2 text-center text-muted-foreground">
        No recent {filterType !== 'all' ? `${filterType} ` : ''}events found.
      </div>
    );
  }

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
                    href={`https://github.com/${event.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View on GitHub <ArrowUpRight className="w-3 h-3" />
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
