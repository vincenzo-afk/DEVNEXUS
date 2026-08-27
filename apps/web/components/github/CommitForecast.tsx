'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export interface CommitForecastPoint {
  date: string;
  day?: string;
  fullDay?: string;
  predicted: number;
  confidence: number;
}

interface CommitForecastProps {
  forecast: CommitForecastPoint[] | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: CommitForecastPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const date = new Date(`${point.date}T00:00:00Z`);
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs shadow-2xl">
      <p className="mb-1 text-muted-foreground">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })}</p>
      <p className="text-sm font-bold" style={{ color: 'hsl(var(--primary))' }}>Predicted: {point.predicted} commits</p>
      <p className="mt-0.5 text-muted-foreground">Confidence: {point.confidence}%</p>
    </div>
  );
}

export default function CommitForecast({ forecast }: CommitForecastProps) {
  const chartData = useMemo(() => (forecast ?? []).map((point) => {
    const date = new Date(`${point.date}T00:00:00Z`);
    return {
      ...point,
      day: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      fullDay: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' }),
    };
  }), [forecast]);

  if (!forecast || chartData.length === 0) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-muted-foreground">
        Forecast data is not available yet. Connect GitHub and retry the sync.
      </div>
    );
  }

  const average = Math.round(chartData.reduce((sum, point) => sum + point.predicted, 0) / chartData.length);
  const peak = chartData.reduce((best, point) => point.predicted > best.predicted ? point : best, chartData[0]);
  const avgConfidence = Math.round(chartData.reduce((sum, point) => sum + point.confidence, 0) / chartData.length);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Commit Forecast — Next 7 Days</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Derived from your contribution history by day of week.</p>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {[
          { label: 'Avg / day', value: average },
          { label: 'Peak day', value: chartData.find((p) => p.date === peak.date)?.day ?? peak.date },
          { label: 'Avg confidence', value: `${avgConfidence}%` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs">
            <span className="text-muted-foreground">{stat.label}: </span><span className="font-semibold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>
      <div className="min-h-[200px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#commitGradient)" dot={{ fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2, r: 4 }} activeDot={{ fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2, r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
