'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Lightbulb, Code2, Sparkles, Send } from 'lucide-react';

interface Phase {
  id: number;
  name: string;
  icon: React.ReactNode;
  checklist: { id: string; label: string }[];
}

const phases: Phase[] = [
  {
    id: 0,
    name: 'Ideation',
    icon: <Lightbulb className="w-4 h-4" />,
    checklist: [
      { id: 'i1', label: 'Brainstorm problem statements' },
      { id: 'i2', label: 'Research existing solutions' },
      { id: 'i3', label: 'Define unique value proposition' },
      { id: 'i4', label: 'Create initial wireframes' },
    ],
  },
  {
    id: 1,
    name: 'Build',
    icon: <Code2 className="w-4 h-4" />,
    checklist: [
      { id: 'b1', label: 'Setup repository & CI/CD' },
      { id: 'b2', label: 'Implement core features' },
      { id: 'b3', label: 'Build API integrations' },
      { id: 'b4', label: 'Create database schema' },
    ],
  },
  {
    id: 2,
    name: 'Polish',
    icon: <Sparkles className="w-4 h-4" />,
    checklist: [
      { id: 'p1', label: 'Refine UI/UX design' },
      { id: 'p2', label: 'Fix critical bugs' },
      { id: 'p3', label: 'Optimize performance' },
      { id: 'p4', label: 'Write documentation' },
    ],
  },
  {
    id: 3,
    name: 'Submit',
    icon: <Send className="w-4 h-4" />,
    checklist: [
      { id: 's1', label: 'Record demo video' },
      { id: 's2', label: 'Write project description' },
      { id: 's3', label: 'Submit on DevPost/platform' },
      { id: 's4', label: 'Share on social media' },
    ],
  },
];

interface PhaseTrackerProps {
  currentPhase: number;
}

export default function PhaseTracker({ currentPhase }: PhaseTrackerProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <p className="text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-widest mb-3">
        Phase Progress
      </p>

      {/* Phase steps */}
      <div className="flex items-center gap-0 mb-4">
        {phases.map((phase, i) => {
          const isCompleted = phase.id < currentPhase;
          const isCurrent = phase.id === currentPhase;
          const isFuture = phase.id > currentPhase;

          return (
            <div key={phase.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    phase-step w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${isCompleted ? 'phase-step-completed bg-green-500 text-white' : ''}
                    ${isCurrent ? 'phase-step-current bg-[var(--accent-primary)] text-white ring-4 ring-[var(--accent-primary)]/25' : ''}
                    ${isFuture ? 'phase-step-future bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-tertiary)]' : ''}
                  `}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : phase.icon}
                </div>
                <span
                  className={`text-xs font-semibold mt-1.5 ${
                    isCurrent
                      ? 'text-[var(--accent-primary)]'
                      : isCompleted
                      ? 'text-green-400'
                      : 'text-[var(--text-tertiary)]'
                  }`}
                >
                  {phase.name}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 rounded transition-all duration-500 ${
                    phase.id < currentPhase ? 'bg-green-500' : 'bg-[var(--border)]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentPhase / (phases.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full"
        />
      </div>

      {/* Current phase checklist */}
      {currentPhase < phases.length && (
        <div className="space-y-1.5">
          <p className="text-xs text-[var(--text-tertiary)] font-medium mb-2">
            {phases[currentPhase]?.name} Checklist:
          </p>
          {phases[currentPhase]?.checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className="flex items-center gap-2.5 w-full text-left group"
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                  checked[item.id]
                    ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                    : 'border-[var(--border)] group-hover:border-[var(--accent-primary)]'
                }`}
              >
                {checked[item.id] && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span
                className={`text-xs transition-all ${
                  checked[item.id]
                    ? 'line-through text-[var(--text-tertiary)]'
                    : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
