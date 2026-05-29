'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Star, GitFork, AlertCircle, ExternalLink } from 'lucide-react';
import StatsCards from '@/components/github/StatsCards';
import ContributionHeatmap from '@/components/github/ContributionHeatmap';
import CommitForecast from '@/components/github/CommitForecast';
import RepoHealthScore from '@/components/github/RepoHealthScore';

const MOCK_STATS = {
  totalStars: 142,
  totalForks: 38,
  prsMerged: 87,
  contributionStreak: 12,
  starsThisWeek: 8,
  forksThisWeek: 3,
  prsThisWeek: 5,
  streakChange: 2,
};

const MOCK_REPOS_HEALTH = [
  { id: 1, name: 'devnexus-frontend', language: 'TypeScript', languageColor: '#3178c6', healthScore: 94 },
  { id: 2, name: 'devnexus-backend', language: 'Python', languageColor: '#3572A5', healthScore: 88 },
  { id: 3, name: 'hacker-tools-cli', language: 'Rust', languageColor: '#dea584', healthScore: 81 },
  { id: 4, name: 'smart-todo-scheduler', language: 'Go', languageColor: '#00ADD8', healthScore: 68 },
  { id: 5, name: 'personal-site-v4', language: 'JavaScript', languageColor: '#f1e05a', healthScore: 48 },
];

const MOCK_ALL_REPOS = [
  {
    id: 'repo-1',
    name: 'devnexus-frontend',
    description: 'The Next.js 14 Web Command Center and dashboard. Beautifully themed, dynamic, and integrated with Gemini AI.',
    stars: 84,
    forks: 21,
    language: 'TypeScript',
    languageColor: '#3178c6',
    openIssues: 2,
    updatedAt: '2 hours ago',
  },
  {
    id: 'repo-2',
    name: 'devnexus-backend',
    description: 'FastAPI Python API server serving Gemini AI endpoint summaries, smart TODO scores, judge simulation, and DB connections.',
    stars: 48,
    forks: 12,
    language: 'Python',
    languageColor: '#3572A5',
    openIssues: 0,
    updatedAt: '4 hours ago',
  },
  {
    id: 'repo-3',
    name: 'hacker-tools-cli',
    description: 'A lightning fast Rust CLI utility to scrape hackathon sites, submit ideas to judge simulations, and manage TODOs from terminal.',
    stars: 8,
    forks: 2,
    language: 'Rust',
    languageColor: '#dea584',
    openIssues: 5,
    updatedAt: 'Yesterday',
  },
  {
    id: 'repo-4',
    name: 'smart-todo-scheduler',
    description: 'Go service to prioritize tasks dynamically using time decay algorithms and urgency parameters.',
    stars: 2,
    forks: 3,
    language: 'Go',
    languageColor: '#00ADD8',
    openIssues: 1,
    updatedAt: '3 days ago',
  },
  {
    id: 'repo-5',
    name: 'personal-site-v4',
    description: 'Statically-generated Next.js portfolio website showing projects, experience timeline, and blog posts.',
    stars: 12,
    forks: 1,
    language: 'JavaScript',
    languageColor: '#f1e05a',
    openIssues: 6,
    updatedAt: 'Last week',
  },
];

export default function GitHubPage() {
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
      <StatsCards stats={MOCK_STATS} />

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
          <RepoHealthScore repos={MOCK_REPOS_HEALTH} />
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
          {MOCK_ALL_REPOS.map((repo) => (
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
                    <h3 className="font-semibold text-white text-base hover:text-indigo-400 cursor-pointer flex items-center gap-1.5">
                      {repo.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Updated {repo.updatedAt}</span>
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
