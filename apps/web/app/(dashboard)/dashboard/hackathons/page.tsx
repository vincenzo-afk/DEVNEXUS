'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Calendar, AlertCircle, PlusCircle, ArrowRight, Sparkles } from 'lucide-react';
import HackathonCard from '@/components/hackathons/HackathonCard';
import PitchGenerator from '@/components/hackathons/PitchGenerator';

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

const INITIAL_HACKATHONS: Hackathon[] = [
  {
    id: 'h1',
    name: 'Supabase Launch Week 11 Hackathon',
    theme: 'Build open source apps with Supabase Realtime, Vector, and Storage.',
    prizePool: '$5,000 + GitHub Enterprise',
    deadline: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000), // 36 hours from now
    status: 'active',
    teamMembers: [
      { name: 'Vincenzo', avatar: 'V' },
      { name: 'Gemini', avatar: 'G' },
    ],
    techStack: ['Next.js 14', 'TypeScript', 'Supabase Realtime', 'TailwindCSS'],
    currentPhase: 1, // Build
    description: 'DevNexus is our entry! Combining real-time GitHub telemetry, AI progress narratives, and smart TODO engines in a custom-designed workspace.',
  },
  {
    id: 'h2',
    name: 'Google Gemini API Developer Competition',
    theme: 'Build the most innovative applications using the Gemini API.',
    prizePool: 'DeLorean + $1,000,000',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    status: 'upcoming',
    teamMembers: [
      { name: 'Vincenzo', avatar: 'V' },
      { name: 'Gemini', avatar: 'G' },
      { name: 'Copilot', avatar: 'C' },
    ],
    techStack: ['FastAPI', 'Python', 'Google Gemini Pro', 'LangChain', 'Svelte'],
    currentPhase: 0, // Ideation
    description: 'Leveraging Gemini 1.5 Pro deep context window to generate weekly narratives and simulate tough developer hackathon judges.',
  },
  {
    id: 'h3',
    name: 'Vercel Ship 2025 Hack',
    theme: 'Deploy groundbreaking serverless or edge-based solutions.',
    prizePool: '$10,000 Vercel Credits',
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: 'completed',
    teamMembers: [
      { name: 'Vincenzo', avatar: 'V' },
    ],
    techStack: ['Next.js', 'Vercel Edge', 'Redis', 'TailwindCSS'],
    currentPhase: 3, // Submit
    description: 'Developed an edge-based URL routing framework that reduces middleware latency by 45%. Submitted and verified.',
  },
];

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>(INITIAL_HACKATHONS);
  const [pitchData, setPitchData] = useState<{ projectName: string; description: string; stack: string[] } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [newPrize, setNewPrize] = useState('');
  const [newDays, setNewDays] = useState('7');
  const [newDesc, setNewDesc] = useState('');
  const [newStack, setNewStack] = useState('');

  const handleAddHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTheme.trim()) return;

    const newHack: Hackathon = {
      id: 'h-' + Date.now(),
      name: newName,
      theme: newTheme,
      prizePool: newPrize || '$1,000',
      deadline: new Date(Date.now() + Number(newDays) * 24 * 60 * 60 * 1000),
      status: 'active',
      teamMembers: [{ name: 'Vincenzo', avatar: 'V' }],
      techStack: newStack.split(',').map(s => s.trim()).filter(s => s.length > 0),
      currentPhase: 0,
      description: newDesc,
    };

    setHackathons([newHack, ...hackathons]);
    setIsAdding(false);
    // Reset Form
    setNewName('');
    setNewTheme('');
    setNewPrize('');
    setNewDays('7');
    setNewDesc('');
    setNewStack('');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            🏆 Hackathon Mission Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track milestones, generate elevator pitches, and run simulated AI judge sessions.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Hackathon
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Entries', value: hackathons.filter(h => h.status === 'active').length, color: 'text-indigo-400' },
          { label: 'Total Entered', value: hackathons.length, color: 'text-white' },
          { label: 'Wins & Submissions', value: hackathons.filter(h => h.status === 'completed').length, color: 'text-green-400' },
          { label: 'Urgent Deadlines (<48h)', value: hackathons.filter(h => h.status === 'active' && (h.deadline.getTime() - Date.now() < 48 * 60 * 60 * 1000)).length, color: 'text-rose-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 rounded-2xl border border-white/8 bg-white/2">
            <span className="text-xs text-muted-foreground font-semibold block">{stat.label}</span>
            <span className={`text-2xl font-bold mt-1 block ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Add Hackathon Form Overlay */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card border border-white/10 rounded-2xl p-6 bg-white/3 backdrop-blur-md overflow-hidden"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Register New Hackathon</h2>
            <form onSubmit={handleAddHackathon} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">Hackathon Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. TreeHacks 2026"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">Theme / Track</label>
                  <input
                    type="text"
                    required
                    value={newTheme}
                    onChange={e => setNewTheme(e.target.value)}
                    placeholder="e.g. AI-assisted productivity"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">Prize Pool</label>
                  <input
                    type="text"
                    value={newPrize}
                    onChange={e => setNewPrize(e.target.value)}
                    placeholder="e.g. $25,000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">Deadline (Days from now)</label>
                  <input
                    type="number"
                    min="1"
                    value={newDays}
                    onChange={e => setNewDays(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    value={newStack}
                    onChange={e => setNewStack(e.target.value)}
                    placeholder="Next.js, Tailwind, Gemini"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">Project Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Enter details about what you plan to build..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white shadow-lg transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Hackathon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((hack) => (
          <HackathonCard
            key={hack.id}
            hackathon={hack}
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

      {/* Pitch Generator Modal */}
      <AnimatePresence>
        {pitchData && (
          <PitchGenerator
            projectName={pitchData.projectName}
            description={pitchData.description}
            stack={pitchData.stack}
            onClose={() => setPitchData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
