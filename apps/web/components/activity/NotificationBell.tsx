'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';
import { dismissNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api-client';

type NotificationType = 'star' | 'pr' | 'deadline' | 'critical' | 'issue';

interface Notification {
  id: string;
  type: NotificationType;
  icon: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
}

function formatTimeAgo(value: string): string {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const typeColors: Record<NotificationType, string> = {
  star: '#f59e0b',
  pr: '#22c55e',
  deadline: '#f97316',
  critical: '#ef4444',
  issue: '#f59e0b',
};

export default function NotificationBell() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setError(null);
      setNotifications(await getNotifications(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (status === 'authenticated') loadNotifications();
  }, [status, loadNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, [isOpen]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markRead = async (id: string) => {
    if (!token) return;
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    try { await markNotificationRead(id, token); } catch { loadNotifications(); }
  };

  const markAllRead = async () => {
    if (!token) return;
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    try { await markAllNotificationsRead(token); } catch { loadNotifications(); }
  };

  const dismiss = async (id: string) => {
    if (!token) return;
    setNotifications((items) => items.filter((item) => item.id !== id));
    try { await dismissNotification(id, token); } catch { loadNotifications(); }
  };

  return (
    <div className="relative">
      <motion.button ref={triggerRef} onClick={() => setIsOpen((open) => !open)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-haspopup="dialog" aria-expanded={isOpen}>
        <Bell className="h-4 w-4" />
        <AnimatePresence>{unreadCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</motion.span>}</AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div ref={panelRef} initial={{ opacity: 0, y: -10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.96 }} className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#111930]/95 shadow-2xl backdrop-blur-xl" role="dialog" aria-label="Notifications panel">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2"><span className="text-sm font-semibold text-white">Notifications</span>{unreadCount > 0 && <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">{unreadCount} new</span>}</div>{unreadCount > 0 && <button onClick={markAllRead} className="text-[10px] font-semibold text-indigo-300 hover:text-indigo-200">Mark all read</button>}</div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? <div className="px-4 py-8 text-center text-xs text-white/50">Loading notifications…</div> : error ? <div className="px-4 py-8 text-center text-xs text-rose-300">{error}</div> : notifications.length === 0 ? <div className="px-4 py-8 text-center text-xs text-white/50">You’re all caught up.</div> : notifications.map((notification) => (
                <div key={notification.id} className={`group flex gap-3 border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5 ${notification.read ? 'opacity-60' : ''}`}>
                  <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm" style={{ color: typeColors[notification.type] }}>{notification.icon}</span>
                  <button className="min-w-0 flex-1 text-left" onClick={() => !notification.read && markRead(notification.id)}><div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold text-white">{notification.title}</p><span className="whitespace-nowrap text-[9px] text-white/35">{formatTimeAgo(notification.timestamp)}</span></div><p className="mt-1 text-[11px] leading-relaxed text-white/55">{notification.body}</p></button>
                  <div className="flex flex-shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">{!notification.read && <button onClick={() => markRead(notification.id)} aria-label="Mark notification as read" className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-green-300"><Check className="h-3 w-3" /></button>}<button onClick={() => dismiss(notification.id)} aria-label="Dismiss notification" className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-rose-300"><X className="h-3 w-3" /></button></div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 px-4 py-2 text-center text-[10px] text-white/35">Synced from your GitHub activity</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
