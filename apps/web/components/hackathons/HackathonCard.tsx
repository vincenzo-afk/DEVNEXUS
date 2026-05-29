'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, DollarSign, Sparkles, Gavel } from 'lucide-react';
import PhaseTracker from './PhaseTracker';
import JudgeSimulator from './JudgeSimulator';

interface TeamMember {
  name: string;
  avatar: string;
}

interface Hackathon {
  id: string;
  name: string;
  theme: string;
  prizePool: string;
  deadline: Date;
  status: 'active' | 'upcoming' | 'completed';
  teamMembers: TeamMember[];
  techStack: string[];
  currentPhase: number;
  description: string;
}

interface HackathonCardProps {
  hackathon: Hackathon;
  onGeneratePitch: () => void;
}

function useCountdown(deadline: Date) {
  const [timeLeft, setTimeLeft] = useState(() => deadline.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(deadline.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return timeLeft;
}

function CountdownBadge({ deadline }: { deadline: Date }) {
  const timeLeft = useCountdown(deadline);

  if (timeLeft <= 0) {
    return (
      <span className="countdown-danger text-xs font-bold px-3 py-1 rounded-full">
        ⏰ Deadline Passed
      </span>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);

  let className = 'countdown-safe';
  if (timeLeft < 2 * 24 * 60 * 60 * 1000) className = 'countdown-danger';
  else if (timeLeft < 7 * 24 * 60 * 60 * 1000) className = 'countdown-warn';

  return (
    <span className={`${className} text-xs font-bold px-3 py-1 rounded-full font-mono`}>
      {days > 0
        ? `${days}d ${hours}h ${mins}m`
        : `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}
    </span>
  );
}

const statusConfig = {
  active: {
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    label: '🟢 Active',
  },
  upcoming: {
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    label: '🟡 Upcoming',
  },
  completed: {
    gradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
    border: 'border-green-500/30',
    badge: 'bg-green-500/20 text-green-300 border-green-500/30',
    label: '✅ Completed',
  },
};

const avatarColors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-amber-500', 'bg-green-500',
  'bg-pink-500', 'bg-cyan-500',
];

export default function HackathonCard({ hackathon, onGeneratePitch }: HackathonCardProps) {
  const [judgeOpen, setJudgeOpen] = useState(false);
  const cfg = statusConfig[hackathon.status];

  return (
    <>
      <div
        className={`glass-card rounded-3xl border ${cfg.border} overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col`}
      >
        {/* Colored header gradient */}
        <div className={`bg-gradient-to-r ${cfg.gradient} px-6 pt-6 pb-5 border-b ${cfg.border}`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />
                <h3 className="font-black text-[var(--text-primary)] text-lg leading-tight truncate">
                  {hackathon.name}
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] text-sm">{hackathon.theme}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap flex-shrink-0 ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="font-black text-[var(--accent-primary)] text-base">
                {hackathon.prizePool}
              </span>
            </div>
            {hackathon.status !== 'completed' && (
              <CountdownBadge deadline={hackathon.deadline} />
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 space-y-5">
          {/* Description */}
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2">
            {hackathon.description}
          </p>

          {/* Team */}
          <div>
            <p className="text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-widest mb-2">
              Team
            </p>
            <div className="flex items-center gap-1">
              {hackathon.teamMembers.map((member, i) => (
                <div
                  key={i}
                  title={member.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[var(--bg-card)] ${
                    avatarColors[i % avatarColors.length]
                  }`}
                  style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: hackathon.teamMembers.length - i }}
                >
                  {member.avatar}
                </div>
              ))}
              <span className="ml-3 text-xs text-[var(--text-tertiary)]">
                {hackathon.teamMembers.length} members
              </span>
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <p className="text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-widest mb-2">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hackathon.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Phase Tracker */}
          <PhaseTracker currentPhase={hackathon.currentPhase} />
        </div>

        {/* Footer buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <motion.button
            onClick={onGeneratePitch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-bold hover:bg-[var(--accent-primary)]/90 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generate Pitch
          </motion.button>
          <motion.button
            onClick={() => setJudgeOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] text-sm font-bold hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all"
          >
            <Gavel className="w-4 h-4" />
            Judge Simulator
          </motion.button>
        </div>
      </div>

      {judgeOpen && (
        <JudgeSimulator
          hackathonName={hackathon.name}
          description={hackathon.description}
          onClose={() => setJudgeOpen(false)}
        />
      )}
    </>
  );
}
