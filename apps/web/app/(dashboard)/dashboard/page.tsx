'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Calendar, 
  RefreshCw, 
  Flame, 
  Star, 
  CheckSquare, 
  Trophy, 
  Play, 
  ChevronRight, 
  Activity, 
  TrendingUp 
} from 'lucide-react';
import { 
  getLatestChronicle, 
  generateChronicle, 
  getTodos, 
  getHackathons, 
  getGitHubStats 
} from '@/lib/api-client';
import ThemeSelector from '@/components/shared/ThemeSelector';

interface Chronicle {
  id: string;
  date: string;
  headline: string;
  narrative: string;
  mood: string;
}

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [chronicle, setChronicle] = useState<Chronicle | null>(null);
  const [stats, setStats] = useState({
    streak: 0,
    stars: 0,
    todosDone: 0,
    activeHacks: 0,
  });
  const [loadingChronicle, setLoadingChronicle] = useState(true);
  const [generatingChronicle, setGeneratingChronicle] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOverviewData = async (token: string) => {
    try {
      setLoadingStats(true);
      // Fetch stats
      const [todosList, hackathonsList, githubStats] = await Promise.all([
        getTodos(token).catch(() => []),
        getHackathons(token).catch(() => []),
        getGitHubStats(token).catch(() => ({ contributionStreak: 0, totalStars: 0 })),
      ]);

      const doneCount = todosList.filter((t: any) => t.status === 'done').length;
      const activeHacksCount = hackathonsList.filter((h: any) => h.status !== 'completed').length;

      setStats({
        streak: githubStats.contributionStreak || 0,
        stars: githubStats.totalStars || 0,
        todosDone: doneCount,
        activeHacks: activeHacksCount,
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchChronicle = async (token: string) => {
    try {
      setLoadingChronicle(true);
      const data = await getLatestChronicle(token);
      setChronicle(data);
    } catch (err) {
      console.error('Failed to load chronicle:', err);
    } finally {
      setLoadingChronicle(false);
    }
  };

  const handleGenerateChronicle = async () => {
    if (!session?.accessToken) return;
    try {
      setGeneratingChronicle(true);
      const data = await generateChronicle(session.accessToken);
      setChronicle(data);
    } catch (err) {
      console.error('Failed to generate chronicle:', err);
    } finally {
      setGeneratingChronicle(false);
    }
  };

  const handleRefresh = async () => {
    if (!session?.accessToken) return;
    setIsRefreshing(true);
    await Promise.all([
      fetchOverviewData(session.accessToken),
      fetchChronicle(session.accessToken)
    ]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchOverviewData(session.accessToken);
      fetchChronicle(session.accessToken);
    }
  }, [session?.accessToken]);

  const getMoodEmoji = (mood: string) => {
    const moods: Record<string, string> = {
      focused: '🎯',
      chill: '🍵',
      chaotic: '🔥',
      productive: '⚡',
      exhausted: '☕',
    };
    return moods[mood.toLowerCase()] || '👾';
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-16">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            📊 Creator Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your active tasks, hackathon pipelines, and AI-powered productivity summaries.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <ThemeSelector />
          
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('vibe:activate'))}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl text-xs font-bold text-indigo-400 shadow-md transition-all"
            id="overview-vibe-activate"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Lofi Music
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 border border-white/10 hover:bg-white/5 rounded-xl transition-all text-white/60 hover:text-white disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Streak */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">GitHub Streak</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{loadingStats ? '...' : stats.streak}</span>
            <span className="text-xs text-orange-400 font-bold">Days</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Active contribution velocity</p>
        </motion.div>

        {/* Stars */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">GitHub Stars</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{loadingStats ? '...' : stats.stars}</span>
            <span className="text-xs text-yellow-400 font-bold">Total</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Across all repository branches</p>
        </motion.div>

        {/* Todos Completed */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Completed Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{loadingStats ? '...' : stats.todosDone}</span>
            <span className="text-xs text-green-400 font-bold">Done</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Tasks completed in database</p>
        </motion.div>

        {/* Active Hackathons */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Active Hackathons</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{loadingStats ? '...' : stats.activeHacks}</span>
            <span className="text-xs text-purple-400 font-bold">Live</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Projects in mission control</p>
        </motion.div>
      </div>

      {/* Chronicle Section */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-md relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute top-0 right-0 w-[400px] h-[250px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full filter blur-[80px] pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6 relative z-10 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/35 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                NEXUS AI Chronicle
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {!loadingChronicle && chronicle && (
            <button
              onClick={handleGenerateChronicle}
              disabled={generatingChronicle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${generatingChronicle ? 'animate-spin' : ''}`} />
              Re-generate
            </button>
          )}
        </div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {loadingChronicle ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 flex flex-col items-center justify-center gap-3 text-center"
              >
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/25 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-400 animate-spin" />
                </div>
                <p className="text-xs text-indigo-400 font-semibold animate-pulse mt-2">Retrieving latest narrative from chronicle log...</p>
              </motion.div>
            ) : chronicle ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                    {chronicle.headline}
                  </h3>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/8 rounded-full text-xs font-bold text-indigo-300">
                    <span>{getMoodEmoji(chronicle.mood)}</span>
                    <span className="capitalize">{chronicle.mood}</span>
                  </span>
                </div>
                
                <p className="text-sm text-white/70 leading-relaxed font-mono whitespace-pre-line border-l-2 border-indigo-500/30 pl-4 py-1">
                  {chronicle.narrative}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center gap-4 max-w-md mx-auto"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  ✨
                </div>
                <h3 className="text-sm font-bold text-white">No Chronicle Today</h3>
                <p className="text-xs text-muted-foreground">
                  The chronicle scheduler narrative is empty. Complete tasks or push commits today, then let Nexus chronicle your journey.
                </p>
                <button
                  onClick={handleGenerateChronicle}
                  disabled={generatingChronicle}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg transition-all disabled:opacity-50"
                >
                  {generatingChronicle ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generating Narrative...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Daily Chronicle
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Activity Redirect / Prompt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => window.location.href = '/dashboard/todos'}
          className="glass-card p-6 rounded-2xl border border-white/10 bg-white/2 hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Review Pending Tasks</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Auto-prioritized task checklist</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30" />
        </div>
        
        <div 
          onClick={() => window.location.href = '/dashboard/activity'}
          className="glass-card p-6 rounded-2xl border border-white/10 bg-white/2 hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Live Activity Stream</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Telemetries and event flow</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30" />
        </div>
      </div>
    </div>
  );
}
