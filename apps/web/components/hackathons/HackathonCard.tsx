'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, DollarSign, Sparkles, Gavel } from 'lucide-react';
import PhaseTracker from './PhaseTracker';
import JudgeSimulator from './JudgeSimulator';

interface ChecklistItem {
  id: string;
  phase: number;
  title: string;
  completed: boolean;
}

interface Hackathon {
  id: string;
  name: string;
  theme: string;
  prizePool: string;
  deadline: string;
  status: 'active' | 'upcoming' | 'completed';
  teamMembers: { name: string; avatar: string }[];
  techStack: string[];
  currentPhase: number;
  description: string;
  checklist: ChecklistItem[];
}

interface HackathonCardProps {
  hackathon: Hackathon;
  token: string;
  onGeneratePitch: () => void;
  onToggleChecklistItem: (itemId: string, completed: boolean) => Promise<void>;
  onUpdatePhase: (phaseId: number) => Promise<void>;
}

function useCountdown(deadlineStr: string) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const deadline = new Date(deadlineStr);
    setTimeLeft(deadline.getTime() - Date.now());
    const interval = setInterval(() => {
      setTimeLeft(deadline.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineStr]);

  return timeLeft;
}

function CountdownBadge({ deadlineStr }: { deadlineStr: string }) {
  const timeLeft = useCountdown(deadlineStr);

  if (timeLeft <= 0) {
    return (
      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
        Deadline Passed
      </span>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);

  let className = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  if (timeLeft < 2 * 24 * 60 * 60 * 1000) className = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  else if (timeLeft < 7 * 24 * 60 * 60 * 1000) className = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

  return (
    <span className={`${className} text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono`}>
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
    label: '✓ Completed',
  },
};

const avatarColors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-amber-500', 'bg-green-500',
  'bg-pink-500', 'bg-cyan-500',
];

export default function HackathonCard({
  hackathon,
  token,
  onGeneratePitch,
  onToggleChecklistItem,
  onUpdatePhase,
}: HackathonCardProps) {
  const [judgeOpen, setJudgeOpen] = useState(false);
  const cfg = statusConfig[hackathon.status] || statusConfig.active;

  return (
    <>
      <div
        className={`glass-card rounded-3xl border ${cfg.border} overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col bg-white/3 backdrop-blur-md`}
      >
        {/* Header gradient band */}
        <div className={`bg-gradient-to-r ${cfg.gradient} px-6 pt-6 pb-5 border-b border-white/5`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <h3 className="font-bold text-white text-base leading-tight truncate">
                  {hackathon.name}
                </h3>
              </div>
              <p className="text-white/55 text-xs line-clamp-1">{hackathon.theme}</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-indigo-400 text-sm">
                {hackathon.prizePool}
              </span>
            </div>
            {hackathon.status !== 'completed' && (
              <CountdownBadge deadlineStr={hackathon.deadline} />
            )}
          </div>
        </div>

        {/* Body content */}
        <div className="px-6 py-5 flex-1 space-y-5">
          <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
            {hackathon.description}
          </p>

          {/* Team Members */}
          <div>
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-2">
              Team Crew
            </p>
            <div className="flex items-center gap-1">
              {hackathon.teamMembers.map((member, i) => (
                <div
                  key={i}
                  title={member.name}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-900 ${
                    avatarColors[i % avatarColors.length]
                  }`}
                  style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: hackathon.teamMembers.length - i }}
                >
                  {member.avatar}
                </div>
              ))}
              <span className="ml-3 text-[10px] text-white/40 font-semibold">
                {hackathon.teamMembers.length} developer{hackathon.teamMembers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-2">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hackathon.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-white/60"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Phase tracker linked to toggles */}
          <PhaseTracker
            currentPhase={hackathon.currentPhase}
            checklist={hackathon.checklist}
            onToggleChecklistItem={onToggleChecklistItem}
          />
        </div>

        {/* Action Controls */}
        <div className="px-6 pb-6 flex gap-3 mt-auto shrink-0 border-t border-white/5 pt-4">
          <button
            onClick={onGeneratePitch}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Pitch AI
          </button>
          
          <button
            onClick={() => setJudgeOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/65 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-600/10 text-xs font-bold transition-all"
          >
            <Gavel className="w-3.5 h-3.5" />
            Simulate Judge
          </button>
        </div>
      </div>

      {judgeOpen && (
        <JudgeSimulator
          hackathonName={hackathon.name}
          description={hackathon.description}
          token={token}
          onClose={() => setJudgeOpen(false)}
        />
      )}
    </>
  );
}
