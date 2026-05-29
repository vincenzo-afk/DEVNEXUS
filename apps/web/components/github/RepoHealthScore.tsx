'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Repo {
  id: number;
  name: string;
  language: string;
  languageColor: string;
  healthScore: number;
}

interface HealthBreakdown {
  README: number;
  'CI/CD': number;
  Tests: number;
  Docs: number;
  Issues: number;
}

function getScoreBreakdown(score: number): HealthBreakdown {
  // Distribute score across 5 dimensions (each max 20)
  const base = Math.floor(score / 5);
  const remainder = score % 5;
  return {
    README: base + (remainder > 0 ? 1 : 0),
    'CI/CD': base + (remainder > 1 ? 1 : 0),
    Tests: base + (remainder > 2 ? 1 : 0),
    Docs: base + (remainder > 3 ? 1 : 0),
    Issues: base,
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Work';
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  TSX: '#61dafb',
  HCL: '#844FBA',
  Svelte: '#ff3e00',
  Shell: '#89e051',
};

interface AnimatedBarProps {
  value: number;
  max: number;
  color: string;
  delay?: number;
}

function AnimatedBar({ value, max, color, delay = 0 }: AnimatedBarProps) {
  const pct = (value / max) * 100;
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: 'hsl(var(--secondary))' }}
    >
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function RepoRow({ repo, rank }: { repo: Repo; rank: number }) {
  const [hovered, setHovered] = useState(false);
  const color = getScoreColor(repo.healthScore);
  const breakdown = getScoreBreakdown(repo.healthScore);
  const langColor = LANGUAGE_COLORS[repo.language] ?? '#888';

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="p-3 rounded-xl cursor-pointer transition-colors duration-200"
        whileHover={{ x: 4 }}
        style={{
          background: hovered ? 'hsl(var(--secondary) / 0.7)' : 'transparent',
          border: hovered ? `1px solid ${color}30` : '1px solid transparent',
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
              style={{
                background: color + '20',
                color,
                border: `1px solid ${color}40`,
              }}
            >
              {rank}
            </span>
            <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">
              {repo.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: langColor + '20',
                color: langColor,
                border: `1px solid ${langColor}40`,
              }}
            >
              {repo.language}
            </span>
            <span
              className="text-sm font-bold"
              style={{ color }}
            >
              {repo.healthScore}
            </span>
          </div>
        </div>

        {/* Main progress bar */}
        <AnimatedBar
          value={repo.healthScore}
          max={100}
          color={color}
          delay={rank * 0.1}
        />

        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{getScoreLabel(repo.healthScore)}</span>
          <span className="text-[10px] text-muted-foreground">{repo.healthScore}/100</span>
        </div>
      </motion.div>

      {/* Breakdown tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-30 mx-2 rounded-xl p-3 shadow-2xl"
            style={{
              top: '100%',
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              backdropFilter: 'blur(16px)',
            }}
          >
            <p className="text-xs font-semibold text-foreground mb-2">Score Breakdown</p>
            <div className="space-y-1.5">
              {(Object.entries(breakdown) as [keyof HealthBreakdown, number][]).map(
                ([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-12">{key}</span>
                    <div
                      className="flex-1 h-1 rounded-full overflow-hidden"
                      style={{ background: 'hsl(var(--secondary))' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(val / 20) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color }}>
                      {val}/20
                    </span>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RepoHealthScore({ repos }: { repos: Repo[] }) {
  const sorted = [...repos].sort((a, b) => b.healthScore - a.healthScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-1"
    >
      {sorted.map((repo, i) => (
        <RepoRow key={repo.id} repo={repo} rank={i + 1} />
      ))}

      {/* Average health */}
      <div
        className="mt-4 p-3 rounded-xl text-xs"
        style={{
          background: 'hsl(var(--secondary) / 0.5)',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Average health score</span>
          <span className="font-bold text-foreground">
            {Math.round(repos.reduce((a, b) => a + b.healthScore, 0) / repos.length)}/100
          </span>
        </div>
      </div>
    </motion.div>
  );
}
