'use client';

import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionCalendarData {
  total_contributions: number;
  weeks: ContributionWeek[];
}

interface DayData extends ContributionDay {
  dateValue: Date;
  dateLabel: string;
}

interface ContributionHeatmapProps {
  calendar: ContributionCalendarData | null;
}

function getColor(day: ContributionDay): string {
  const levels = [
    'var(--color-empty)',
    'hsl(var(--primary) / 0.3)',
    'hsl(var(--primary) / 0.5)',
    'hsl(var(--primary) / 0.7)',
    'hsl(var(--primary))',
  ];
  return levels[day.level] ?? levels[0];
}

const CELL_SIZE = 11;
const CELL_GAP = 2;
const STEP = CELL_SIZE + CELL_GAP;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', 'Wed', 'Fri'];
const DAY_LABEL_ROWS = [1, 3, 5];

function longestStreak(days: DayData[]): number {
  return days.reduce(
    (state, day) => ({
      current: day.count > 0 ? state.current + 1 : 0,
      longest: Math.max(state.longest, day.count > 0 ? state.current + 1 : 0),
    }),
    { current: 0, longest: 0 },
  ).longest;
}

export default function ContributionHeatmap({ calendar }: ContributionHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: DayData } | null>(null);

  const data = useMemo<DayData[]>(() => {
    if (!calendar) return [];
    return calendar.weeks.flatMap((week) =>
      week.days.map((day) => {
        const dateValue = new Date(`${day.date}T00:00:00Z`);
        return {
          ...day,
          dateValue,
          dateLabel: dateValue.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          }),
        };
      }),
    );
  }, [calendar]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i -= 1) {
      if (data[i].count > 0) streak += 1;
      else break;
    }
    return streak;
  }, [data]);
  const maxStreak = useMemo(() => longestStreak(data), [data]);
  const weeks = calendar?.weeks ?? [];
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIdx) => {
      const firstDay = week.days[0];
      if (!firstDay) return;
      const month = new Date(`${firstDay.date}T00:00:00Z`).getUTCMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTHS[month], weekIdx });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  if (!calendar || data.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center text-sm text-muted-foreground">
        Contribution data is not available yet. Connect GitHub and retry the sync.
      </div>
    );
  }

  const svgWidth = weeks.length * STEP + 36;
  const svgHeight = 7 * STEP + 20;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full">
      <style>{`:root { --color-empty: hsl(var(--secondary)); }`}</style>
      <div className="mb-4 flex flex-wrap items-center gap-6 text-sm">
        <div className="text-muted-foreground"><span className="font-semibold text-foreground">{currentStreak}</span> day current streak</div>
        <div className="text-muted-foreground"><span className="font-semibold text-foreground">{maxStreak}</span> day longest streak</div>
        <div className="ml-auto text-xs text-muted-foreground">Based on GitHub contribution history</div>
      </div>

      <div ref={containerRef} className="relative overflow-x-auto">
        <svg width={svgWidth} height={svgHeight + 20} className="block" style={{ minWidth: svgWidth }} role="img" aria-label="GitHub contribution calendar">
          {monthLabels.map(({ label, weekIdx }) => (
            <text key={`${label}-${weekIdx}`} x={36 + weekIdx * STEP} y={12} fontSize={10} fill="hsl(var(--muted-foreground))" fontFamily="inherit">{label}</text>
          ))}
          {DAY_LABELS.map((label, i) => (
            <text key={label} x={0} y={20 + DAY_LABEL_ROWS[i] * STEP + CELL_SIZE} fontSize={9} fill="hsl(var(--muted-foreground))" fontFamily="inherit">{label}</text>
          ))}
          {weeks.map((week, weekIdx) => week.days.map((day, dayIdx) => {
            const dateValue = new Date(`${day.date}T00:00:00Z`);
            const dayData: DayData = {
              ...day,
              dateValue,
              dateLabel: dateValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
            };
            return (
              <rect
                key={day.date}
                x={36 + weekIdx * STEP}
                y={20 + dayIdx * STEP}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                fill={getColor(day)}
                style={{ cursor: 'pointer', transition: 'opacity .15s' }}
                onMouseEnter={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const container = containerRef.current?.getBoundingClientRect();
                  if (container) setTooltip({ x: rect.left - container.left + CELL_SIZE / 2, y: rect.top - container.top - 10, day: dayData });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          }))}
        </svg>
        {tooltip && (
          <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xl" style={{ left: tooltip.x, top: tooltip.y }}>
            <span className="font-bold">{tooltip.day.count} contribution{tooltip.day.count === 1 ? '' : 's'}</span> on {tooltip.day.dateLabel}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{calendar.total_contributions.toLocaleString()}</span> contributions in the last year</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => <span key={level} className="rounded-sm border border-white/10" style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: getColor({ date: '', count: level * 4, level }) }} />)}
          <span>More</span>
        </div>
      </div>
    </motion.div>
  );
}
