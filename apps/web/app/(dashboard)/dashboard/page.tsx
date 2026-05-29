'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Search, Filter, RefreshCw, GitCommit, GitPullRequest, AlertCircle, Star } from 'lucide-react';
import ActivityFeed from '@/components/activity/ActivityFeed';

type FilterType = 'all' | 'push' | 'pr' | 'issue' | 'star';

export default function DashboardOverview() {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const filterButtons: { key: FilterType; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'all', label: 'All Activity', icon: <Radio size={14} />, color: 'hover:text-white' },
    { key: 'push', label: 'Commits', icon: <GitCommit size={14} />, color: 'hover:text-indigo-400' },
    { key: 'pr', label: 'Pull Requests', icon: <GitPullRequest size={14} />, color: 'hover:text-green-400' },
    { key: 'issue', label: 'Issues', icon: <AlertCircle size={14} />, color: 'hover:text-amber-400' },
    { key: 'star', label: 'Stars', icon: <Star size={14} />, color: 'hover:text-yellow-400' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            📡 Live Activity Feed
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time event streaming of commits, code integrations, stars, and issues from your GitHub.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            GitHub Live
          </span>
          <button
            onClick={handleRefresh}
            className="p-2 border border-white/10 hover:bg-white/5 rounded-xl transition-all text-white/60 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Filter Column */}
        <div className="lg:col-span-1 glass-card p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md space-y-5">
          <div>
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Event Filters
            </h3>
            <div className="flex flex-col gap-1.5">
              {filterButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setFilterType(btn.key)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    filterType === btn.key
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                      : `bg-transparent border-transparent text-white/60 hover:bg-white/5 ${btn.color}`
                  }`}
                >
                  {btn.icon}
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Feed Column */}
        <div className="lg:col-span-3 space-y-4">
          {isRefreshing ? (
            <div className="py-24 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            </div>
          ) : (
            <ActivityFeed key={refreshKey} filterType={filterType} />
          )}
        </div>
      </div>
    </div>
  );
}
