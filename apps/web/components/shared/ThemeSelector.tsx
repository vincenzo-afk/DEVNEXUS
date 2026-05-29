'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Popover from '@radix-ui/react-popover';
import { useThemeStore } from '@/stores/useThemeStore';

// ─── Types ─────────────────────────────────────────────────────────────────────
type ThemeId = 'midnight' | 'cyberpunk' | 'forest' | 'arctic' | 'solarized';

interface ThemeOption {
  id: ThemeId;
  emoji: string;
  name: string;
  colors: {
    bg: string;
    accent: string;
    secondary: string;
    text: string;
  };
}

// ─── Theme Definitions ─────────────────────────────────────────────────────────
const THEMES: ThemeOption[] = [
  {
    id: 'midnight',
    emoji: '🌙',
    name: 'Midnight Hacker',
    colors: {
      bg: '#080d1a',
      accent: '#6366f1',
      secondary: '#1e1b4b',
      text: '#e2e8f0',
    },
  },
  {
    id: 'cyberpunk',
    emoji: '🌈',
    name: 'Neon Cyberpunk',
    colors: {
      bg: '#0a0014',
      accent: '#f0f',
      secondary: '#1a0033',
      text: '#00ffff',
    },
  },
  {
    id: 'forest',
    emoji: '🌲',
    name: 'Forest Dev',
    colors: {
      bg: '#0a1a0e',
      accent: '#22c55e',
      secondary: '#14532d',
      text: '#dcfce7',
    },
  },
  {
    id: 'arctic',
    emoji: '❄️',
    name: 'Arctic White',
    colors: {
      bg: '#f0f4f8',
      accent: '#3b82f6',
      secondary: '#dbeafe',
      text: '#1e293b',
    },
  },
  {
    id: 'solarized',
    emoji: '☀️',
    name: 'Solarized Gold',
    colors: {
      bg: '#1c1507',
      accent: '#f59e0b',
      secondary: '#2d1f00',
      text: '#fef3c7',
    },
  },
];

// ─── Theme Swatch ──────────────────────────────────────────────────────────────
function ThemeSwatch({ theme }: { theme: ThemeOption }) {
  return (
    <div
      className="theme-swatch"
      style={{ background: theme.colors.bg }}
      aria-hidden="true"
    >
      <div
        className="theme-swatch__accent"
        style={{ background: theme.colors.accent }}
      />
      <div
        className="theme-swatch__secondary"
        style={{ background: theme.colors.secondary }}
      />
      <div
        className="theme-swatch__dot"
        style={{ background: theme.colors.text, opacity: 0.6 }}
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ThemeSelector() {
  const { theme: activeTheme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (themeId: ThemeId) => {
      setTheme(themeId);
      setOpen(false);
    },
    [setTheme],
  );

  const currentTheme = THEMES.find((t) => t.id === activeTheme) ?? THEMES[0];

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <motion.button
            className="theme-trigger"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Change theme"
            aria-haspopup="dialog"
            aria-expanded={open}
            id="theme-selector-trigger"
          >
            <ThemeSwatch theme={currentTheme} />
            <span className="theme-trigger__label">
              {currentTheme.emoji} {currentTheme.name}
            </span>
            <motion.span
              className="theme-trigger__chevron"
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▾
            </motion.span>
          </motion.button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="theme-popover"
            side="bottom"
            align="end"
            sideOffset={8}
            aria-label="Theme options"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
            >
              <div className="theme-popover__header">
                <span className="theme-popover__title">Choose Theme</span>
              </div>

              <div className="theme-list" role="listbox" aria-label="Available themes">
                {THEMES.map((t) => {
                  const isActive = t.id === activeTheme;
                  return (
                    <motion.button
                      key={t.id}
                      className={`theme-option ${isActive ? 'theme-option--active' : ''}`}
                      onClick={() => handleSelect(t.id)}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.15 }}
                      role="option"
                      aria-selected={isActive}
                      id={`theme-option-${t.id}`}
                      data-theme-id={t.id}
                    >
                      <ThemeSwatch theme={t} />
                      <div className="theme-option__info">
                        <span className="theme-option__emoji">{t.emoji}</span>
                        <span className="theme-option__name">{t.name}</span>
                      </div>
                      <AnimatePresence>
                        {isActive && (
                          <motion.span
                            className="theme-option__check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            aria-label="Currently selected"
                          >
                            ✓
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>

              <div className="theme-popover__footer">
                <span className="theme-popover__hint">
                  Theme is saved automatically
                </span>
              </div>

              <Popover.Arrow className="theme-popover__arrow" />
            </motion.div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <style jsx>{`
        /* Trigger */
        .theme-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          cursor: pointer;
          color: inherit;
          font-size: 13px;
          font-weight: 600;
          transition: background 0.15s, border-color 0.15s;
        }
        .theme-trigger:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .theme-trigger__label {
          white-space: nowrap;
          font-size: 12.5px;
        }
        .theme-trigger__chevron {
          font-size: 11px;
          opacity: 0.6;
          display: inline-block;
        }

        /* Swatch */
        .theme-swatch {
          width: 32px;
          height: 20px;
          border-radius: 5px;
          overflow: hidden;
          display: flex;
          position: relative;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .theme-swatch__accent {
          width: 40%;
          height: 100%;
        }
        .theme-swatch__secondary {
          width: 40%;
          height: 100%;
        }
        .theme-swatch__dot {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        /* Popover */
        .theme-popover {
          background: rgba(10, 14, 28, 0.98);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 16px;
          overflow: hidden;
          min-width: 220px;
          backdrop-filter: blur(24px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05);
          z-index: 9999;
        }
        .theme-popover__header {
          padding: 12px 16px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
        .theme-popover__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Theme List */
        .theme-list {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .theme-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.15s, border-color 0.15s;
        }
        .theme-option:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .theme-option--active {
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(99, 102, 241, 0.3);
        }
        .theme-option__info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .theme-option__emoji {
          font-size: 15px;
        }
        .theme-option__name {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
        }
        .theme-option__check {
          color: #6366f1;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Footer */
        .theme-popover__footer {
          padding: 8px 16px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }
        .theme-popover__hint {
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.25);
        }

        /* Arrow */
        .theme-popover__arrow {
          fill: rgba(10, 14, 28, 0.98);
        }
      `}</style>
    </>
  );
}
