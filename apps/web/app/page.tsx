'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Zap,
  Brain,
  CheckSquare,
  Trophy,
  Activity,
  BookOpen,
  BarChart3,
  Command,
  ArrowRight,
  Sparkles,
  Code2,
  Star,
} from 'lucide-react';

// ─── Animation Variants ────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Typewriter Component ────────────────────────────────────────────────────

const TYPEWRITER_LINES = [
  'Your commits, narrated by AI.',
  'Focus mode: only your top 3 tasks.',
  'Hackathon pitch in 10 seconds.',
  'Real-time GitHub stats, beautifully rendered.',
];

function Typewriter() {
  const [lineIdx, setLineIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const line = TYPEWRITER_LINES[lineIdx];
    let timeout: NodeJS.Timeout;

    if (!deleting && displayed.length < line.length) {
      timeout = setTimeout(() => setDisplayed(line.slice(0, displayed.length + 1)), 45);
    } else if (!deleting && displayed.length === line.length) {
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 22);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setLineIdx((prev) => (prev + 1) % TYPEWRITER_LINES.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, lineIdx]);

  return (
    <span className="text-indigo-400 font-mono">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// ─── Floating Orb ────────────────────────────────────────────────────────────

interface OrbProps {
  size: number;
  x: string;
  y: string;
  color: string;
  delay: number;
  duration: number;
}

function FloatingOrb({ size, x, y, color, delay, duration }: OrbProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: color,
        filter: 'blur(80px)',
        opacity: 0.25,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  badge?: string;
}

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: 'AI Progress Narratives',
    description:
      'Gemini AI analyzes your recent commits and generates compelling daily progress stories that read like a dev blog.',
    gradient: 'from-violet-500 to-indigo-500',
    badge: 'AI Powered',
  },
  {
    icon: Github,
    title: 'Real-Time GitHub Stats',
    description:
      'Live commit counts, streak tracking, repo activity heatmaps, and language breakdowns — all in one beautiful panel.',
    gradient: 'from-gray-400 to-slate-500',
  },
  {
    icon: CheckSquare,
    title: 'Smart TODO Engine',
    description:
      'AI-prioritized task lists that adapt to your coding patterns. Drag-to-reorder, tagging, and streak rewards.',
    gradient: 'from-emerald-400 to-teal-500',
    badge: 'Focus Mode',
  },
  {
    icon: Trophy,
    title: 'Hackathon Mission Control',
    description:
      'Track every hackathon from registration to submission. Countdown timers, judge contacts, and elevator pitch generator.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: BookOpen,
    title: 'Dev Notebook',
    description:
      'Markdown editor with syntax highlighting, AI-powered summarization, and tag-based search for your technical notes.',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Activity,
    title: 'Activity Feed',
    description:
      'A beautiful timeline of everything you\'ve done: commits, completed tasks, hackathon milestones, all in one stream.',
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    icon: BarChart3,
    title: 'Project Analytics',
    description:
      'Deep-dive charts on velocity, burndown rates, language stats, and productivity heatmaps across all your projects.',
    gradient: 'from-purple-400 to-violet-500',
  },
  {
    icon: Command,
    title: 'Command Palette',
    description:
      'Keyboard-first navigation with Cmd+K. Jump to any project, run AI actions, switch themes — all without lifting your hands.',
    gradient: 'from-indigo-400 to-blue-500',
    badge: '⌘K',
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 overflow-hidden cursor-default"
      style={{
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Gradient hover glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      />
      {/* Icon */}
      <div
        className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Badge */}
      {feature.badge && (
        <span
          className={`absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${feature.gradient} text-white shadow`}
        >
          {feature.badge}
        </span>
      )}

      <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-white/55 leading-relaxed">{feature.description}</p>

      {/* Bottom accent line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
    </motion.div>
  );
}

// ─── Theme Preview Card ───────────────────────────────────────────────────────

const THEMES = [
  { name: 'Midnight', key: 'midnight', primary: '#6366f1', bg: '#0f0f1a', accent: '#818cf8' },
  { name: 'Aurora', key: 'aurora', primary: '#22c55e', bg: '#0a1a0f', accent: '#4ade80' },
  { name: 'Neon', key: 'neon', primary: '#f97316', bg: '#0f0a00', accent: '#fb923c' },
  { name: 'Ocean', key: 'ocean', primary: '#06b6d4', bg: '#020f1a', accent: '#22d3ee' },
  { name: 'Ember', key: 'ember', primary: '#ef4444', bg: '#1a0505', accent: '#f87171' },
];

function ThemePreview({ theme }: { theme: (typeof THEMES)[0] }) {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ scale: 1.05, y: -4 }}
      className="relative rounded-xl overflow-hidden border border-white/10 cursor-default"
      style={{ background: theme.bg, boxShadow: `0 0 30px ${theme.primary}22` }}
    >
      {/* Mini header */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10"
        style={{ background: `${theme.primary}15` }}
      >
        <div className="w-2 h-2 rounded-full bg-red-400 opacity-80" />
        <div className="w-2 h-2 rounded-full bg-yellow-400 opacity-80" />
        <div className="w-2 h-2 rounded-full bg-green-400 opacity-80" />
        <span className="ml-2 text-xs font-mono" style={{ color: theme.accent }}>
          devnexus
        </span>
      </div>
      {/* Mini content */}
      <div className="p-3 space-y-2">
        <div className="h-2 rounded-full w-3/4" style={{ background: theme.primary }} />
        <div className="h-1.5 rounded-full w-1/2 opacity-40" style={{ background: theme.accent }} />
        <div className="h-1.5 rounded-full w-5/6 opacity-25" style={{ background: theme.accent }} />
        <div className="flex gap-2 mt-2">
          <div
            className="h-5 w-12 rounded text-xs flex items-center justify-center font-semibold"
            style={{ background: theme.primary, color: '#fff', fontSize: 8 }}
          >
            ▶ Run
          </div>
          <div
            className="h-5 w-12 rounded text-xs flex items-center justify-center font-semibold opacity-50"
            style={{ border: `1px solid ${theme.primary}`, color: theme.accent, fontSize: 8 }}
          >
            ⌘ K
          </div>
        </div>
      </div>
      {/* Theme name label */}
      <div className="px-3 pb-3">
        <span className="text-xs font-semibold" style={{ color: theme.accent }}>
          {theme.name}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080812] text-white">
      {/* ── Background ─────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Floating Orbs */}
        <FloatingOrb size={600} x="5%" y="-10%" color="radial-gradient(circle, #6366f1, transparent)" delay={0} duration={12} />
        <FloatingOrb size={500} x="65%" y="10%" color="radial-gradient(circle, #8b5cf6, transparent)" delay={3} duration={15} />
        <FloatingOrb size={400} x="30%" y="60%" color="radial-gradient(circle, #06b6d4, transparent)" delay={6} duration={18} />
        <FloatingOrb size={350} x="80%" y="70%" color="radial-gradient(circle, #f97316, transparent)" delay={1} duration={10} />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-3 bg-[#080812]/80 backdrop-blur-xl border-b border-white/10'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              DevNexus
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#themes" className="hover:text-white transition-colors">Themes</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>
          <a
            href="/api/auth/signin"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-semibold text-white shadow-lg shadow-indigo-600/30"
          >
            Get Started
          </a>
        </div>
      </motion.nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-6">
            <span className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Powered by Gemini AI
            </span>
          </motion.div>

          {/* ASCII-inspired logo area */}
          <motion.div
            variants={fadeInUp}
            className="font-mono text-xs text-indigo-400/40 mb-4 hidden md:block select-none"
          >
            {'╔══════════════════════════════╗'}
            <br />
            {'║   DevNexus Command Center    ║'}
            <br />
            {'╚══════════════════════════════╝'}
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
              The AI-Powered
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Creator Command Center
            </span>
          </motion.h1>

          {/* Typewriter subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-white/60 mb-4 min-h-[28px]"
          >
            <Typewriter />
          </motion.p>

          <motion.p variants={fadeInUp} className="text-base text-white/45 mb-10 max-w-xl mx-auto">
            Built for indie developers and student hackers who want to ship faster, stay focused, and
            let AI narrate their journey.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.a
              href="/api/auth/signin"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/40 transition-all duration-300"
            >
              <Github className="w-5 h-5" />
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-base backdrop-blur transition-all duration-300"
            >
              <Star className="w-4 h-4 text-yellow-400" />
              View on GitHub
            </motion.a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 flex flex-col items-center gap-2 text-white/25"
          >
            <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-10 bg-gradient-to-b from-indigo-400/40 to-transparent"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-10 px-6 border-y border-white/8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: '10+', label: 'Features', icon: '🚀' },
              { value: '5', label: 'Beautiful Themes', icon: '🎨' },
              { value: 'Gemini', label: 'AI Powered', icon: '🤖' },
              { value: 'Open', label: 'Source', icon: '⭐' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="flex flex-col items-center text-center py-4 px-6 rounded-2xl border border-white/8 bg-white/4 backdrop-blur"
              >
                <span className="text-2xl mb-1">{stat.icon}</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  {stat.value}
                </span>
                <span className="text-sm text-white/50">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-4 tracking-widest uppercase"
            >
              <Code2 className="w-3 h-3" /> Feature Set
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-4"
            >
              Everything a hacker needs
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/50 max-w-xl mx-auto text-base">
              Eight powerful modules that work together to make you an unstoppable developer.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Theme Showcase ─────────────────────────────────────────────────── */}
      <section id="themes" className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-xs font-semibold mb-4 tracking-widest uppercase"
            >
              🎨 Themes
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-4"
            >
              Five stunning themes
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/50 max-w-xl mx-auto">
              Switch instantly between hand-crafted color palettes — each with its own personality
              and vibe.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
          >
            {THEMES.map((theme) => (
              <ThemePreview key={theme.key} theme={theme} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            {/* Glow blob */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
              <div className="w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
            </div>

            <motion.div
              variants={scaleIn}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/50 mb-8 mx-auto"
            >
              <Zap className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-extrabold mb-6"
            >
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Ready to level up
              </span>
              <br />
              <span className="text-white">your dev workflow?</span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-white/55 text-lg mb-10 max-w-xl mx-auto">
              Join developers who ship faster, stay focused, and let AI tell their story. Free to use.
              Open source. Yours to own.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.a
                href="/api/auth/signin"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-lg shadow-2xl shadow-indigo-600/50 transition-all duration-300"
              >
                <Github className="w-5 h-5" />
                Connect GitHub
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-white/30 text-sm mt-8">
              Sign in with GitHub · No credit card required · 100% free
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/8 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/35 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-white/60">DevNexus</span>
            <span>· Built for creators</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white/70 transition-colors">Features</a>
            <a href="#themes" className="hover:text-white/70 transition-colors">Themes</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70 transition-colors flex items-center gap-1"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
