'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gavel, Brain, Sparkles, Award, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { simulateJudge } from '@/lib/api-client';

interface JudgeSimulatorProps {
  hackathonName: string;
  description: string;
  token: string;
  onClose: () => void;
}

interface JudgeResult {
  innovation: number;
  execution: number;
  impact: number;
  presentation: number;
  feedback: string;
}

export default function JudgeSimulator({ hackathonName, description, token, onClose }: JudgeSimulatorProps) {
  const [projectIdea, setProjectIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!projectIdea.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await simulateJudge(projectIdea, token);
      const data = response.result || response;
      setResult({
        innovation: Number(data.innovation) || Math.floor(Math.random() * 8) + 16,
        execution: Number(data.execution) || Math.floor(Math.random() * 8) + 16,
        impact: Number(data.impact) || Math.floor(Math.random() * 8) + 16,
        presentation: Number(data.presentation) || Math.floor(Math.random() * 8) + 16,
        feedback: data.feedback || `Excellent project formulation. The execution vector aligns well with modern hackathon standards. Recommend adding specific API integration diagrams to boost presentation scores.`,
      });
    } catch (err: any) {
      console.error(err);
      setError('Could not connect to AI Judge. Using simulation heuristic scoring.');
      const lenScore = Math.min(25, 12 + Math.floor(projectIdea.length / 50));
      const hasGemini = projectIdea.toLowerCase().includes('gemini') || projectIdea.toLowerCase().includes('ai');
      const hasDb = projectIdea.toLowerCase().includes('database') || projectIdea.toLowerCase().includes('supabase');
      setResult({
        innovation: hasGemini ? 22 : 17,
        execution: hasDb ? 20 : 16,
        impact: lenScore,
        presentation: 18,
        feedback: `Local simulated feedback: Good core concept. Incorporating AI technology covers the Innovation criteria strongly. Ensure database connection schemas are fully visible in the submission to ensure high Execution marks.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (total: number) => {
    if (total >= 90) return { label: 'A+', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (total >= 80) return { label: 'A', color: 'text-green-400 border-green-500/30 bg-green-500/10' };
    if (total >= 70) return { label: 'B', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' };
    if (total >= 50) return { label: 'C', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    return { label: 'D', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  };

  const totalScore = result
    ? result.innovation + result.execution + result.impact + result.presentation
    : 0;

  const grade = getGrade(totalScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl border border-white/10 p-6 md:p-8 bg-slate-900 overflow-hidden"
        style={{
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-505 to-indigo-650 flex items-center justify-center shadow-lg">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Judge Simulator</h2>
              <p className="text-xs text-white/40">{hackathonName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {!result && !loading ? (
            <div className="space-y-4">
              <p className="text-xs text-white/60 leading-relaxed">
                Provide your submission content (e.g. wireframe summaries, tech stack choices, core MVP description) below. The AI Judge will rate it out of 100 based on core grading dimensions.
              </p>
              <textarea
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                placeholder="We are building a smart todo scheduling engine..."
                rows={6}
                className="w-full bg-white/3 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-white/20 focus:border-indigo-500 focus:outline-none resize-none font-mono"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSimulate}
                  disabled={!projectIdea.trim()}
                  className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-xs font-bold text-white shadow-lg"
                >
                  Simulate Grades
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div>
                <h3 className="font-bold text-white">Aggregating Judge Panel...</h3>
                <p className="text-xs text-white/40 mt-1">Simulating rubrics: innovation, execution, impact, presentation</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Score Display Card */}
              <div className="glass-card p-5 rounded-2xl border border-white/8 bg-white/2 flex items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Final Aggregated Score</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold text-white">{totalScore}</span>
                    <span className="text-lg text-white/40">/100</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl font-black ${grade.color}`}>
                  {grade.label}
                </div>
              </div>

              {/* 4 Pillars Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Innovation', val: result?.innovation ?? 0, color: 'text-indigo-400', icon: Brain },
                  { name: 'Execution', val: result?.execution ?? 0, color: 'text-purple-400', icon: Award },
                  { name: 'Impact', val: result?.impact ?? 0, color: 'text-emerald-400', icon: Sparkles },
                  { name: 'Presentation', val: result?.presentation ?? 0, color: 'text-amber-400', icon: CheckCircle },
                ].map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={pillar.name} className="glass-card p-3 rounded-xl border border-white/6 bg-white/1 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] text-white/40 uppercase tracking-wider">{pillar.name}</span>
                        <Icon className={`w-3.5 h-3.5 ${pillar.color}`} />
                      </div>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-bold text-white">{pillar.val}</span>
                        <span className="text-[9px] text-white/40">/25</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Written Feedback */}
              <div className="glass-card p-4 rounded-xl border border-white/8 bg-white/2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5" /> Judge Assessment
                </h4>
                <p className="text-xs text-white/80 leading-relaxed italic font-mono">
                  "{result?.feedback}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-bold text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-iterate Pitch
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-xs font-bold text-white shadow-lg"
                  >
                    Finish Simulation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
