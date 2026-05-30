'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Calendar, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import HackathonCard from '@/components/hackathons/HackathonCard';
import PitchGenerator from '@/components/hackathons/PitchGenerator';
import { getHackathons, createHackathon, updateHackathon, updateChecklistItem } from '@/lib/api-client';

export default function HackathonsPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pitchData, setPitchData] = useState<{ projectName: string; description: string; stack: string[] } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [newPrize, setNewPrize] = useState('');
  const [newDays, setNewDays] = useState('7');
  const [newDesc, setNewDesc] = useState('');
  const [newStack, setNewStack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllHackathons = async (token: string) => {
    try {
      setLoading(true);
      const list = await getHackathons(token);
      setHackathons(list);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch hackathons list. Check backend router connections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllHackathons(token);
    }
  }, [token]);

  const handleAddHackathonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTheme.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const computedDeadline = new Date(Date.now() + Number(newDays) * 24 * 60 * 60 * 1000).toISOString();
      const techStack = newStack.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      
      const newHack = await createHackathon(
        {
          name: newName,
          theme: newTheme,
          deadline: computedDeadline,
          team_members: [session?.user?.name || 'Creator'],
          tech_stack: techStack,
          prize_pool: newPrize || '$1,000',
          status: 'active',
          notes: newDesc,
        },
        token
      );

      setHackathons((prev) => [newHack, ...prev]);
      setIsAdding(false);
      
      // Reset Form
      setNewName('');
      setNewTheme('');
      setNewPrize('');
      setNewDays('7');
      setNewDesc('');
      setNewStack('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleChecklistItem = async (hackathonId: string, itemId: string, completed: boolean) => {
    const token = session?.accessToken;
    if (!token) return;
    try {
      const updatedItem = await updateChecklistItem(hackathonId, itemId, completed, token);
      
      // Map item completion state back to parent hackathon in state
      setHackathons((prev) =>
        prev.map((hack) => {
          if (hack.id === hackathonId) {
            const updatedChecklist = hack.checklist.map((item: any) =>
              item.id === itemId ? { ...item, completed: updatedItem.completed } : item
            );
            
            // Check if all checklist items in current phase are completed to promote to next phase!
            const currentPhase = hack.currentPhase;
            const currentPhaseItems = updatedChecklist.filter((item: any) => item.phase === currentPhase);
            const allCompleted = currentPhaseItems.length > 0 && currentPhaseItems.every((item: any) => item.completed);
            
            let nextPhase = currentPhase;
            if (allCompleted && currentPhase < 3) {
              nextPhase = currentPhase + 1;
              // Optmistically trigger phase update on backend
              updateHackathon(hackathonId, { current_phase: nextPhase }, token);
            }

            return {
              ...hack,
              currentPhase: nextPhase,
              checklist: updatedChecklist,
            };
          }
          return hack;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePhase = async (hackathonId: string, phaseId: number) => {
    if (!token) return;
    try {
      const updated = await updateHackathon(hackathonId, { current_phase: phaseId }, token);
      setHackathons((prev) => prev.map((h) => (h.id === hackathonId ? { ...h, currentPhase: updated.currentPhase } : h)));
    } catch (err) {
      console.error(err);
    }
  };

  if (!session?.accessToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-muted-foreground text-sm">Authenticating session...</p>
      </div>
    );
  }

  if (loading && hackathons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-indigo-400 text-sm font-semibold animate-pulse">Syncing hackathon matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 max-w-md mx-auto text-center mt-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Hackathon Load Failure</h3>
        <p className="text-sm text-white/60 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            🏆 Hackathon Mission Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track design phases, auto-generate pitch summaries, and simulate judges natively.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Register Hackathon
        </button>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Submissions', value: hackathons.filter(h => h.status === 'active').length, color: 'text-indigo-400' },
          { label: 'Total Entries', value: hackathons.length, color: 'text-white' },
          { label: 'Completed Submits', value: hackathons.filter(h => h.status === 'completed').length, color: 'text-emerald-400' },
          { label: 'Critical Deadlines', value: hackathons.filter(h => h.status === 'active' && (new Date(h.deadline).getTime() - Date.now() < 48 * 60 * 60 * 1000)).length, color: 'text-rose-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 rounded-2xl border border-white/8 bg-white/2">
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">{stat.label}</span>
            <span className={`text-2xl font-extrabold mt-1 block ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Add New Entry Form Drawer */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card border border-white/10 rounded-2xl p-6 bg-white/3 backdrop-blur-md overflow-hidden"
          >
            <h2 className="text-base font-bold text-white mb-4">Register New Hackathon Entry</h2>
            <form onSubmit={handleAddHackathonSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Hackathon Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. TreeHacks 2026"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Theme / Prompt</label>
                  <input
                    type="text"
                    required
                    value={newTheme}
                    onChange={e => setNewTheme(e.target.value)}
                    placeholder="e.g. AI-assisted productivity"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Prize Pool</label>
                  <input
                    type="text"
                    value={newPrize}
                    onChange={e => setNewPrize(e.target.value)}
                    placeholder="e.g. $25,000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Deadline (Days from now)</label>
                  <input
                    type="number"
                    min="1"
                    value={newDays}
                    onChange={e => setNewDays(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    value={newStack}
                    onChange={e => setNewStack(e.target.value)}
                    placeholder="Next.js, Tailwind, Gemini"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Project Notes / Core Concept</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Enter details about what you plan to build..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Active Hackathon Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((hack) => (
          <HackathonCard
            key={hack.id}
            hackathon={hack}
            token={token || ''}
            onToggleChecklistItem={(itemId, completed) => handleToggleChecklistItem(hack.id, itemId, completed)}
            onUpdatePhase={(phaseId) => handleUpdatePhase(hack.id, phaseId)}
            onGeneratePitch={() =>
              setPitchData({
                projectName: hack.name.split(' ').slice(0, 2).join(' ') + ' App',
                description: hack.description || hack.theme,
                stack: hack.techStack,
              })
            }
          />
        ))}
      </div>

      {/* Elevator Pitch generator modal overlay */}
      <AnimatePresence>
        {pitchData && (
          <PitchGenerator
            projectName={pitchData.projectName}
            description={pitchData.description}
            stack={pitchData.stack}
            token={token || ''}
            onClose={() => setPitchData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
