'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface DayData {
  date: Date;
  count: number;
  dateStr: string;
}

function generateContributionData(): DayData[] {
  const data: DayData[] = [];
  const today = new Date();
  // Start from 364 days ago (52 weeks * 7 days)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);

  // Align to Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  for (let i = 0; i < 371; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dow = date.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6;

    let count = 0;
    const rand = Math.random();

    if (isWeekend) {
      // Weekends: less active
      if (rand < 0.35) count = 0;
      else if (rand < 0.65) count = Math.floor(Math.random() * 3) + 1;
      else if (rand < 0.85) count = Math.floor(Math.random() * 3) + 4;
      else count = Math.floor(Math.random() * 4) + 7;
    } else {
      // Weekdays: more active
      if (rand < 0.12) count = 0;
      else if (rand < 0.35) count = Math.floor(Math.random() * 3) + 1;
      else if (rand < 0.65) count = Math.floor(Math.random() * 3) + 4;
      else if (rand < 0.85) count = Math.floor(Math.random() * 3) + 7;
      else count = Math.floor(Math.random() * 6) + 10;
    }

    // Simulate vacation / low periods
    const month = date.getMonth();
    if (month === 7 && date.getDate() >= 10 && date.getDate() <= 20) {
      count = Math.floor(count * 0.2);
    }

    // Simulate burst periods
    if (month === 3 && date.getDate() >= 1 && date.getDate() <= 15) {
      count = Math.min(15, Math.floor(count * 1.8));
    }

    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    data.push({ date, count, dateStr });
  }

  return data;
}

function getColor(count: number): string {
  if (count === 0) return 'var(--color-empty)';
  if (count <= 3) return 'hsl(var(--primary) / 0.3)';
  if (count <= 6) return 'hsl(var(--primary) / 0.5)';
  if (count <= 9) return 'hsl(var(--primary) / 0.7)';
  return 'hsl(var(--primary))';
}

function getColorLabel(level: number): string {
  const levels = [
    'var(--color-empty)',
    'hsl(var(--primary) / 0.3)',
    'hsl(var(--primary) / 0.5)',
    'hsl(var(--primary) / 0.7)',
    'hsl(var(--primary))',
  ];
  return levels[level] ?? levels[0];
}

const CELL_SIZE = 11;
const CELL_GAP = 2;
const STEP = CELL_SIZE + CELL_GAP;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', 'Wed', 'Fri'];
const DAY_LABEL_ROWS = [1, 3, 5]; // 0-indexed day of week (Mon=1, Wed=3, Fri=5)

export default function ContributionHeatmap() {
  const [data] = useState<DayData[]>(() => generateContributionData());
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    dateStr: string;
    count: number;
  }>({ visible: false, x: 0, y: 0, dateStr: '', count: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const totalContributions = data.reduce((acc, d) => acc + d.count, 0);

  // Build weeks array: each week is an array of 7 days
  const weeks: DayData[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // Compute streak
  let currentStreak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].count > 0) currentStreak++;
    else break;
  }

  // Find longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (const d of data) {
    if (d.count > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Month labels
  const monthLabels: { label: string; weekIdx: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIdx) => {
    const firstDay = week.find((d) => d.date);
    if (firstDay) {
      const month = firstDay.date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: MONTHS[month], weekIdx });
        lastMonth = month;
      }
    }
  });

  const svgWidth = weeks.length * STEP + 36;
  const svgHeight = 7 * STEP + 20;

  const handleMouseEnter = (
    e: React.MouseEvent<SVGRectElement>,
    day: DayData
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = containerRef.current?.getBoundingClientRect();
    if (!container) return;
    setTooltip({
      visible: true,
      x: rect.left - container.left + CELL_SIZE / 2,
      y: rect.top - container.top - 10,
      dateStr: day.dateStr,
      count: day.count,
    });
  };

  const handleMouseLeave = () => {
    setTooltip((t) => ({ ...t, visible: false }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full"
    >
      <style>{`
        :root {
          --color-empty: hsl(var(--secondary));
        }
        .streak-glow rect {
          filter: drop-shadow(0 0 3px hsl(var(--primary) / 0.8));
        }
      `}</style>

      {/* Stats row */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">{currentStreak}</span> day current streak
        </div>
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">{longestStreak}</span> day longest streak
        </div>
        <div className="ml-auto text-muted-foreground text-xs">
          🔥 Keep it up!
        </div>
      </div>

      {/* Heatmap SVG */}
      <div ref={containerRef} className="relative overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight + 20}
          className="block"
          style={{ minWidth: svgWidth }}
        >
          {/* Month labels */}
          {monthLabels.map(({ label, weekIdx }) => (
            <text
              key={label + weekIdx}
              x={36 + weekIdx * STEP}
              y={12}
              fontSize={10}
              fill="hsl(var(--muted-foreground))"
              fontFamily="inherit"
            >
              {label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((label, i) => (
            <text
              key={label}
              x={0}
              y={20 + DAY_LABEL_ROWS[i] * STEP + CELL_SIZE}
              fontSize={9}
              fill="hsl(var(--muted-foreground))"
              fontFamily="inherit"
            >
              {label}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, weekIdx) =>
            week.map((day, dayIdx) => {
              const isStreakDay = day.count > 0;
              const x = 36 + weekIdx * STEP;
              const y = 20 + dayIdx * STEP;
              const color = getColor(day.count);

              return (
                <rect
                  key={day.dateStr}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  ry={2}
                  fill={color}
                  style={{
                    filter:
                      isStreakDay && day.count >= 10
                        ? 'drop-shadow(0 0 3px hsl(var(--primary) / 0.6))'
                        : undefined,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => handleMouseEnter(e, day)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })
          )}
        </svg>

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-xl"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="font-bold">
              {tooltip.count} contribution{tooltip.count !== 1 ? 's' : ''}
            </span>{' '}
            on {tooltip.dateStr}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {totalContributions.toLocaleString()}
          </span>{' '}
          contributions in the last year
        </p>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="rounded-sm"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: getColorLabel(level),
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </motion.div>
  );
}
