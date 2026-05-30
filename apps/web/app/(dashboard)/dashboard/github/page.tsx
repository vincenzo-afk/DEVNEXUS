'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Github, Star, GitFork, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import StatsCards from '@/components/github/StatsCards';
import ContributionHeatmap from '@/components/github/ContributionHeatmap';
import CommitForecast from '@/components/github/CommitForecast';
import RepoHealthScore from '@/components/github/RepoHealthScore';
import { getGitHubStats, getGitHubRepos } from '@/lib/api-client';

export default function GitHubPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.accessToken) return;
      try {
        setLoading(true);
        const [statsData, reposData] = await Promise.all([
          getGitHubStats(session.accessToken),
          getGitHubRepos(session.accessToken)
        ]);
        setStats(statsData);
        setRepos(reposData);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch data from GitHub Command Center. Check API status.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.accessToken) {
      fetchData();
    }
  }, [session?.accessToken]);

  if (!session?.accessToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-muted-foreground text-sm">Authenticating GitHub session...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-indigo-400 text-sm font-semibold animate-pulse">Syncing GitHub telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 max-w-md mx-auto text-center mt-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Telemetry Sync Error</h3>
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
            <Github className="w-8 h-8 text-indigo-400" />
            GitHub Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time developer analytics, repository health metrics, and commit forecast.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      {stats && <StatsCards stats={stats} />}

      {/* Heatmap Grid */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden bg-white/3 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Contribution Heatmap</h2>
            <p className="text-xs text-muted-foreground">Your contribution history over the past 365 days.</p>
          </div>
        </div>
        <ContributionHeatmap />
      </div>

      {/* Middle row: Repo Health & Commit Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Repo Health Score Card (5/12 columns) */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Repository Health</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Automated quality, README, and workflow score.</p>
          </div>
          <RepoHealthScore repos={repos} />
        </div>

        {/* Commit Forecast Card (7/12 columns) */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md">
          <CommitForecast />
        </div>
      </div>

      {/* Bottom section: Repositories List */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">All Repositories</h2>
          <p className="text-xs text-muted-foreground">Track stats, active work, and health of active repositories.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <motion.div
              key={repo.id}
              whileHover={{ y: -4, border: '1px solid rgba(99,102,241,0.25)' }}
              className="glass-card p-5 rounded-2xl border border-white/8 hover:border-white/20 transition-all duration-300 bg-white/2 backdrop-blur-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: repo.languageColor }}
                    />
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white text-base hover:text-indigo-400 cursor-pointer flex items-center gap-1.5"
                    >
                      {repo.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Updated {new Date(repo.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-white/55 line-clamp-2 leading-relaxed mb-4">
                  {repo.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold pt-2 border-t border-white/5 text-muted-foreground">
                <span className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                  <Star className="w-3.5 h-3.5" />
                  {repo.stars} stars
                </span>
                <span className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                  <GitFork className="w-3.5 h-3.5" />
                  {repo.forks} forks
                </span>
                {repo.openIssues > 0 && (
                  <span className="flex items-center gap-1 text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {repo.openIssues} open issues
                  </span>
                )}
                <span className="ml-auto text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">
                  {repo.language}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
