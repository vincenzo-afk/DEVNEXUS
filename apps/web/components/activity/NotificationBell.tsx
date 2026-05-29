'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────────────────
type NotificationType = 'star' | 'pr' | 'deadline' | 'critical';

interface Notification {
  id: string;
  type: NotificationType;
  icon: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: Date;
}

// ─── Mock Initial Notifications ────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'star',
    icon: '⭐',
    title: 'New Star',
    body: 'Someone starred devnexus',
    read: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'notif-2',
    type: 'pr',
    icon: '✅',
    title: 'PR Merged',
    body: 'PR #42 was merged into main',
    read: false,
    timestamp: new Date(Date.now() - 28 * 60 * 1000),
  },
  {
    id: 'notif-3',
    type: 'deadline',
    icon: '⚠️',
    title: 'Deadline Alert',
    body: 'Hackathon deadline in 2 hours!',
    read: false,
    timestamp: new Date(Date.now() - 55 * 60 * 1000),
  },
  {
    id: 'notif-4',
    type: 'critical',
    icon: '🔴',
    title: 'Critical Issue',
    body: 'Critical issue on repo: auth-service',
    read: true,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
];

const STORAGE_KEY = 'devnexus:notifications';
const READ_KEY = 'devnexus:notifications:read';

// ─── Utilities ─────────────────────────────────────────────────────────────────
function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getTypeColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    star: '#f59e0b',
    pr: '#22c55e',
    deadline: '#f97316',
    critical: '#ef4444',
  };
  return colors[type];
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <div className="notif-wrapper" style={{ position: 'relative' }}>
      {/* Bell Button */}
      <motion.button
        ref={triggerRef}
        className="notif-bell-btn"
        onClick={() => setIsOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications${hasUnread ? `, ${unreadCount} unread` : ''}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        id="notification-bell"
        animate={
          hasUnread
            ? {
                rotate: [0, -8, 8, -8, 8, 0],
              }
            : {}
        }
        transition={{ duration: 0.5, repeat: hasUnread ? Infinity : 0, repeatDelay: 4 }}
      >
        <span className="notif-bell-icon" aria-hidden="true">
          🔔
        </span>

        {/* Badge */}
        <AnimatePresence>
          {hasUnread && (
            <motion.span
              className="notif-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400 }}
              aria-hidden="true"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            className="notif-panel"
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-label="Notifications panel"
            aria-modal="false"
          >
            {/* Panel Header */}
            <div className="notif-panel__header">
              <div className="notif-panel__header-left">
                <span className="notif-panel__title">Notifications</span>
                {hasUnread && (
                  <span className="notif-panel__count-badge">{unreadCount} new</span>
                )}
              </div>
              {hasUnread && (
                <button
                  className="notif-mark-all-btn"
                  onClick={markAllRead}
                  aria-label="Mark all notifications as read"
                  id="notif-mark-all-read"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="notif-list" role="list">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <span>🎉</span>
                  <span>You're all caught up!</span>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    className={`notif-item ${!notif.read ? 'notif-item--unread' : ''}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    layout
                    role="listitem"
                    onClick={() => markRead(notif.id)}
                    style={{ cursor: notif.read ? 'default' : 'pointer' }}
                  >
                    {/* Color accent bar */}
                    <div
                      className="notif-item__accent"
                      style={{ background: getTypeColor(notif.type) }}
                      aria-hidden="true"
                    />

                    {/* Icon */}
                    <div
                      className="notif-item__icon"
                      style={{
                        background: `${getTypeColor(notif.type)}22`,
                        border: `1px solid ${getTypeColor(notif.type)}44`,
                      }}
                      aria-hidden="true"
                    >
                      {notif.icon}
                    </div>

                    {/* Content */}
                    <div className="notif-item__content">
                      <div className="notif-item__header-row">
                        <span className="notif-item__title">{notif.title}</span>
                        {!notif.read && (
                          <span
                            className="notif-item__unread-dot"
                            aria-label="Unread"
                          />
                        )}
                      </div>
                      <span className="notif-item__body">{notif.body}</span>
                      <span className="notif-item__time">
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                    </div>

                    {/* Dismiss */}
                    <button
                      className="notif-item__dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notif.id);
                      }}
                      aria-label={`Dismiss notification: ${notif.title}`}
                    >
                      ✕
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="notif-panel__footer">
                <button
                  className="notif-clear-btn"
                  onClick={() => setNotifications([])}
                  aria-label="Clear all notifications"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .notif-wrapper {
          display: inline-flex;
          align-items: center;
        }

        /* Bell Button */
        .notif-bell-btn {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          transition: background 0.15s;
        }
        .notif-bell-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .notif-bell-icon {
          display: inline-block;
        }

        /* Badge */
        .notif-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 9px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #080d1a;
          line-height: 1;
        }

        /* Panel */
        .notif-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 340px;
          background: rgba(9, 12, 25, 0.98);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(24px);
          z-index: 9999;
        }

        /* Panel header */
        .notif-panel__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
        .notif-panel__header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .notif-panel__title {
          font-size: 14px;
          font-weight: 800;
          color: #e2e8f0;
        }
        .notif-panel__count-badge {
          font-size: 10px;
          font-weight: 700;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #a78bfa;
          padding: 2px 8px;
          border-radius: 10px;
        }
        .notif-mark-all-btn {
          font-size: 11.5px;
          color: #6366f1;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .notif-mark-all-btn:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        /* Notification list */
        .notif-list {
          max-height: 380px;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .notif-list::-webkit-scrollbar {
          width: 4px;
        }
        .notif-list::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 2px;
        }

        /* Empty state */
        .notif-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 32px 16px;
          color: rgba(255, 255, 255, 0.3);
          font-size: 13px;
          font-weight: 500;
        }
        .notif-empty span:first-child {
          font-size: 28px;
        }

        /* Notification item */
        .notif-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px 10px 10px;
          border-radius: 12px;
          border: 1px solid transparent;
          transition: background 0.15s;
          overflow: hidden;
        }
        .notif-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.07);
        }
        .notif-item--unread {
          background: rgba(99, 102, 241, 0.05);
          border-color: rgba(99, 102, 241, 0.12);
        }
        .notif-item--unread:hover {
          background: rgba(99, 102, 241, 0.09);
        }

        /* Accent bar */
        .notif-item__accent {
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 3px;
          border-radius: 0 2px 2px 0;
        }

        /* Icon */
        .notif-item__icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
          margin-left: 6px;
        }

        /* Content */
        .notif-item__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .notif-item__header-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .notif-item__title {
          font-size: 12.5px;
          font-weight: 700;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notif-item__unread-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6366f1;
          flex-shrink: 0;
          box-shadow: 0 0 6px rgba(99, 102, 241, 0.6);
        }
        .notif-item__body {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notif-item__time {
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.25);
          margin-top: 2px;
        }

        /* Dismiss */
        .notif-item__dismiss {
          opacity: 0;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          font-size: 11px;
          padding: 2px 5px;
          border-radius: 4px;
          transition: opacity 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .notif-item:hover .notif-item__dismiss {
          opacity: 1;
        }
        .notif-item__dismiss:hover {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.6);
        }

        /* Footer */
        .notif-panel__footer {
          padding: 10px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          justify-content: flex-end;
        }
        .notif-clear-btn {
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.3);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.15s, color 0.15s;
        }
        .notif-clear-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}
