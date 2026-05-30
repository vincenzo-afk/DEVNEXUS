'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, Check, RefreshCw, Volume2, BookOpen, Presentation, Megaphone } from 'lucide-react';
import { generatePitch } from '@/lib/api-client';

interface PitchGeneratorProps {
  projectName: string;
  description: string;
  stack: string[];
  token: string;
  onClose: () => void;
}

interface PitchResult {
  projectName: string;
  hook: string;
  problem: string;
  solution: string;
  demoFlow: string;
  closing: string;
}

export default function PitchGenerator({ projectName, description, stack, token, onClose }: PitchGeneratorProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pitch, setPitch] = useState<PitchResult | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchPitch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await generatePitch(projectName, description, stack, token);
      const data = response.pitch || response;
      setPitch({
        projectName: data.project_name || projectName,
        hook: data.hook || 'Imagine a world where your codebase speaks to you.',
        problem: data.problem || 'Developers waste hours compiling progress summaries and tracking hackathon checklists across multiple platforms.',
        solution: data.solution || `${projectName} puts your entire developer lifecycle on a single screen with automated AI narratives and a smart voice task engine.`,
        demoFlow: data.demo_flow || '1. Sign in with GitHub.\n2. Add tasks with voice inputs.\n3. Run a hackathon judge simulation to optimize your score.',
        closing: data.closing || `DevNexus is open source, free to use, and here to help creators level up. Thank you.`,
      });
    } catch (err: any) {
      console.error(err);
      setError('Failed to contact Gemini AI to generate the pitch. Using offline fallback templates.');
      setPitch({
        projectName,
        hook: `Meet ${projectName} — the ultimate developer command center.`,
        problem: `Indie developers struggle to track streaks, manage notebooks, and prepare pitches.`,
        solution: `${projectName} integrates real-time telemetry, AI narration, and smart todo tracking.`,
        demoFlow: `1. Connect GitHub.\n2. Review health score.\n3. Engage Focus mode.`,
        closing: `Help us build the future of developer workspace. Star us on GitHub!`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPitch();
  }, [projectName]);

  const handleCopy = () => {
    if (!pitch) return;
    const fullText = `
Project: ${pitch.projectName}
-----------------------------------
1. THE HOOK:
${pitch.hook}

2. THE PROBLEM:
${pitch.problem}

3. THE SOLUTION:
${pitch.solution}

4. THE DEMO FLOW:
${pitch.demoFlow}

5. THE CLOSING:
${pitch.closing}
    `.trim();

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-3xl border border-white/10 p-6 md:p-8 bg-slate-900 overflow-hidden"
        style={{
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-505 to-indigo-650 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                AI Pitch Generator
              </h2>
              <p className="text-xs text-white/40">Elevator pitch script generated for {projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-5">
          {loading ? (
            <div className="space-y-6 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2.5 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs mb-4">
              <span className="font-semibold">⚠️ Notice:</span> {error}
            </div>
          ) : null}

          {pitch && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {/* Hook */}
                <div className="glass-card p-4 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 transition-all">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5" /> 1. The Hook
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed italic">
                    "{pitch.hook}"
                  </p>
                </div>

                {/* Problem */}
                <div className="glass-card p-4 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 transition-all">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" /> 2. The Problem
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {pitch.problem}
                  </p>
                </div>

                {/* Solution */}
                <div className="glass-card p-4 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 transition-all">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 3. The Solution
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {pitch.solution}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Demo Flow */}
                <div className="glass-card p-4 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 transition-all">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> 4. The Demo Flow
                  </h3>
                  <div className="text-sm text-white/80 leading-relaxed space-y-1.5 whitespace-pre-line">
                    {pitch.demoFlow}
                  </div>
                </div>

                {/* Closing */}
                <div className="glass-card p-4 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 transition-all">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5" /> 5. The Closing
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {pitch.closing}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button
            onClick={fetchPitch}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-bold text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              disabled={loading || !pitch}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-xs font-bold text-white shadow-lg disabled:opacity-50"
            >
              {copied ? (
                <><Check className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy Script</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
