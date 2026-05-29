'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function DashboardOverview() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 flex flex-col gap-2 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <h1 className="text-3xl font-bold text-foreground">
          Good morning, {session?.user?.name || 'Developer'}!
        </h1>
        <p className="text-muted-foreground">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
        
        <div className="mt-4 p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="font-semibold text-primary">Daily Chronicle</span>
          </div>
          <p className="text-foreground">
            Yesterday was a productive day. You pushed 12 commits, mostly focusing on the new authentication flow. Your GitHub streak is now at 42 days. Keep it up! Next up, you have 3 critical TODOs for the upcoming hackathon.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'GitHub Streak', value: '42 days 🔥', color: 'text-orange-500' },
          { label: 'Stars Today', value: '+3 ⭐', color: 'text-yellow-500' },
          { label: 'TODOs Done', value: '5/8 ✅', color: 'text-green-500' },
          { label: 'Hackathons', value: '2 🏆', color: 'text-purple-500' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
