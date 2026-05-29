'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Github,
  Zap,
  Brain,
  CheckSquare,
  Trophy,
  Activity,
  ArrowRight,
  Lock,
  Shield,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const PERKS = [
  { icon: Brain, text: 'AI progress narratives from your commits' },
  { icon: CheckSquare, text: 'Smart TODO engine with focus mode' },
  { icon: Trophy, text: 'Hackathon mission control dashboard' },
  { icon: Activity, text: 'Real-time GitHub activity analytics' },
];

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleSignIn = async () => {
    await signIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080812]">
      {/* ── Background ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        {/* Orbs */}
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.12, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        <motion.div
          className="absolute top-[40%] left-[55%] w-[350px] h-[350px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
        />
      </div>

      {/* ── Card ────────────────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-3xl border border-white/12 p-8 md:p-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px)',
            boxShadow:
              '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          {/* Logo */}
          <motion.div
            custom={0}
            variants={fadeInUp}
            className="flex flex-col items-center gap-3 mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent tracking-tight">
                DevNexus
              </h1>
              <p className="text-xs text-white/40 font-mono tracking-widest uppercase mt-0.5">
                AI Developer Command Center
              </p>
            </div>
          </motion.div>

          {/* Welcome text */}
          <motion.div custom={1} variants={fadeInUp} className="text-center mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-sm text-white/50">
              Sign in with GitHub to access your personalized developer dashboard.
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex flex-col gap-1"
            >
              <div className="font-semibold flex items-center gap-2 text-red-400">
                <span className="text-base">⚠️</span> Authentication Failed
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                {error === 'OAuthCallbackError' || error === 'OAuthCallback'
                  ? 'Failed to verify GitHub authorization. Please check if your Client ID and Client Secret are valid.'
                  : `An error occurred: ${error}. Please check server logs for details.`}
              </p>
            </motion.div>
          )}

          {/* GitHub Sign In Button */}
          <motion.div custom={2} variants={fadeInUp}>
            <motion.button
              onClick={handleSignIn}
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="group w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-white text-base transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #24292e 0%, #1a1f24 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div
            custom={3}
            variants={fadeInUp}
            className="flex items-center gap-3 my-6"
          >
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/30 font-mono">WHAT YOU GET</span>
            <div className="flex-1 h-px bg-white/8" />
          </motion.div>

          {/* Feature list */}
          <motion.ul custom={4} variants={fadeInUp} className="space-y-3">
            {PERKS.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center border border-indigo-500/25">
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <span className="text-sm text-white/55">{perk.text}</span>
                </li>
              );
            })}
          </motion.ul>

          {/* Trust line */}
          <motion.div
            custom={5}
            variants={fadeInUp}
            className="mt-8 flex items-center justify-center gap-4 text-white/25 text-xs"
          >
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Secure OAuth</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>No password stored</span>
            </div>
            <span>·</span>
            <span>100% Free</span>
          </motion.div>
        </div>

        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow: '0 0 80px rgba(99,102,241,0.12)',
          }}
        />
      </motion.div>

      {/* Bottom label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/25 text-center"
      >
        DevNexus · Built for developers who ship
      </motion.p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#080812] text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
