'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Lightbulb, Code2, Sparkles, Send } from 'lucide-react';

interface ChecklistItem {
  id: string;
  phase: number;
  title: string;
  completed: boolean;
}

interface Phase {
  id: number;
  name: string;
  icon: React.ReactNode;
}

const phases: Phase[] = [
  { id: 0, name: 'Ideation', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 1, name: 'Build', icon: <Code2 className="w-4 h-4" /> },
  { id: 2, name: 'Polish', icon: <Sparkles className="w-4 h-4" /> },
  { id: 3, name: 'Submit', icon: <Send className="w-4 h-4" /> },
];

interface PhaseTrackerProps {
  currentPhase: number;
  checklist: ChecklistItem[];
  onToggleChecklistItem: (itemId: string, completed: boolean) => Promise<void>;
}

export default function PhaseTracker({ currentPhase, checklist, onToggleChecklistItem }: PhaseTrackerProps) {
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (itemId: string, currentVal: boolean) => {
    setToggling(itemId);
    try {
      await onToggleChecklistItem(itemId, !currentVal);
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
    }
  };

  const currentPhaseChecklist = checklist.filter((item) => item.phase === currentPhase);

  return (
    <div>
      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">
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
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : ''}
                    ${isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-650/20' : ''}
                    ${isFuture ? 'bg-white/5 border border-white/10 text-white/40' : ''}
                  `}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : phase.icon}
                </div>
                <span
                  className={`text-[9px] font-bold mt-1.5 uppercase tracking-wide ${
                    isCurrent
                      ? 'text-indigo-400'
                      : isCompleted
                      ? 'text-emerald-400'
                      : 'text-white/40'
                  }`}
                >
                  {phase.name}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 rounded transition-all duration-500 ${
                    phase.id < currentPhase ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentPhase / (phases.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
        />
      </div>

      {/* Current phase checklist */}
      {currentPhase < phases.length && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-2">
            {phases[currentPhase]?.name} Checklist:
          </p>
          {currentPhaseChecklist.length === 0 ? (
            <p className="text-[10px] text-white/20 italic">No checklist tasks defined for this phase.</p>
          ) : (
            currentPhaseChecklist.map((item) => (
              <button
                key={item.id}
                disabled={toggling === item.id}
                onClick={() => handleToggle(item.id, item.completed)}
                className="flex items-center gap-2.5 w-full text-left group disabled:opacity-50"
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                    item.completed
                      ? 'bg-indigo-600 border-indigo-500'
                      : 'border-white/20 group-hover:border-indigo-500'
                  }`}
                >
                  {item.completed && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span
                  className={`text-xs transition-all ${
                    item.completed
                      ? 'line-through text-white/30 font-medium'
                      : 'text-white/70 group-hover:text-white'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
