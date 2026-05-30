'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Brain } from 'lucide-react';

interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

interface Todo {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'todo' | 'inprogress' | 'done';
  dueDate?: string;
  aiScore: number;
  subtasks: Subtask[];
  done: boolean;
}

interface FocusModeProps {
  todos: Todo[];
  onExit: () => void;
}

const POMODORO_SECONDS = 25 * 60;
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch {
    // No audio context
  }
}

export default function FocusMode({ todos, onExit }: FocusModeProps) {
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_SECONDS);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);
  
  // Extract top 3 incomplete High or Medium priority tasks sorted by AI score
  const topTasks = todos
    .filter((t) => !t.done)
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 3);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(
    topTasks.length > 0 ? topTasks[0].id : null
  );
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = (POMODORO_SECONDS - secondsLeft) / POMODORO_SECONDS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleTimerEnd = useCallback(() => {
    setRunning(false);
    playBeep();
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
    setSession((s) => Math.min(s + 1, 4));
    setSecondsLeft(POMODORO_SECONDS);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handleTimerEnd();
            return POMODORO_SECONDS;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, handleTimerEnd]);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(POMODORO_SECONDS);
  };

  const strokeColor =
    secondsLeft < 120
      ? '#ef4444'
      : secondsLeft < 420
      ? '#f59e0b'
      : 'hsl(var(--primary))';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(5,5,15,0.96)' }}
    >
      {/* Ambient backgrounds */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 30% 40%, rgba(99,102,241,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 70% 60%, rgba(168,85,247,0.08) 0%, transparent 70%)
          `,
        }}
      />

      {/* Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 text-xs font-semibold z-10"
      >
        <X className="w-4 h-4" />
        Exit Focus Mode
      </button>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs shadow-2xl z-20"
          >
            🎉 Pomodoro interval completed! Take a break.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-4xl w-full px-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white/90 mb-1">⏱️ Focus Mode</h2>
          <p className="text-white/50 text-xs">Interval {session} of 4</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
          {/* Timer Ring */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <svg width="220" height="220" viewBox="0 0 220 220" className="rotate-[-90deg]">
                <circle
                  cx="110"
                  cy="110"
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="10"
                />
                <circle
                  cx="110"
                  cy="110"
                  r={RADIUS}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-mono font-bold text-white tracking-tight">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-white/40 text-[10px] mt-1 font-bold uppercase tracking-widest">
                  {running ? 'Focusing' : secondsLeft === POMODORO_SECONDS ? 'Ready' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Timer controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={reset}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25"
              >
                {running ? (
                  <><Pause className="w-5 h-5" /> Pause</>
                ) : (
                  <><Play className="w-5 h-5" /> Start Focus</>
                )}
              </button>
            </div>

            {/* Session tracker */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    s < session
                      ? 'bg-indigo-400'
                      : s === session
                      ? 'bg-white scale-125'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Core Priorities to focus on */}
          <div className="space-y-3">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
              Core Priorities
            </h3>
            {topTasks.length === 0 ? (
              <p className="text-xs text-white/40 italic">No incomplete tasks found to focus on.</p>
            ) : (
              topTasks.map((task, i) => {
                const isActive = task.id === activeTaskId;
                return (
                  <motion.button
                    key={task.id}
                    onClick={() => setActiveTaskId(task.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? 'border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/8'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-black ${isActive ? 'text-indigo-400' : 'text-white/30'}`}>
                          #{i + 1}
                        </span>
                        <div>
                          <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-white/70'}`}>
                            {task.title}
                          </p>
                          <p className="text-[10px] mt-0.5 text-white/40 uppercase font-bold tracking-wider">
                            Priority: {task.priority}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs flex-shrink-0">
                        <Brain className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-bold text-indigo-400">{task.aiScore}</span>
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="mt-3 h-0.5 bg-indigo-500/60 rounded-full origin-left"
                      />
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
