'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, GitFork, GitPullRequest, Flame } from 'lucide-react';

interface GitHubStats {
  totalStars: number;
  totalForks: number;
  prsMerged: number;
  contributionStreak: number;
  starsThisWeek: number;
  forksThisWeek: number;
  prsThisWeek: number;
  streakChange: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  change: number;
  changeLabel: string;
  color: string;
  delay: number;
  suffix?: string;
}

function useCountUp(target: number, duration: number = 1800, start: boolean = false) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, start]);

  return count;
}

function StatCard({ icon, label, value, change, changeLabel, color, delay, suffix }: StatCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useCountUp(value, 1600, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="stat-card glass-card rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at top left, ${color}15 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className="p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <div
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{
              color: change > 0 ? '#22c55e' : '#ef4444',
              backgroundColor: change > 0 ? '#22c55e20' : '#ef444420',
              border: `1px solid ${change > 0 ? '#22c55e40' : '#ef444440'}`,
            }}
          >
            {change > 0 ? '↑' : '↓'} {Math.abs(change)} {changeLabel}
          </div>
        </div>

        <div className="mt-1">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-foreground tabular-nums">
              {count.toLocaleString()}
            </span>
            {suffix && (
              <span className="text-lg font-bold mb-0.5" style={{ color }}>
                {suffix}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsCards({ stats }: { stats: GitHubStats }) {
  const cards: StatCardProps[] = [
    {
      icon: <Star size={18} />,
      label: 'Total Stars',
      value: stats.totalStars,
      change: stats.starsThisWeek,
      changeLabel: 'this week',
      color: '#f59e0b',
      delay: 0,
    },
    {
      icon: <GitFork size={18} />,
      label: 'Total Forks',
      value: stats.totalForks,
      change: stats.forksThisWeek,
      changeLabel: 'this week',
      color: '#6366f1',
      delay: 0.08,
    },
    {
      icon: <GitPullRequest size={18} />,
      label: 'PRs Merged',
      value: stats.prsMerged,
      change: stats.prsThisWeek,
      changeLabel: 'this week',
      color: '#8b5cf6',
      delay: 0.16,
    },
    {
      icon: <Flame size={18} />,
      label: 'Contribution Streak 🔥',
      value: stats.contributionStreak,
      change: stats.streakChange,
      changeLabel: 'day',
      color: '#f97316',
      delay: 0.24,
      suffix: 'd',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
