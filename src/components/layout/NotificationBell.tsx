'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, X, Info, MessageSquare, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notification';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchInitial = async () => {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    };
    fetchInitial();

    // 2. Realtime Subscription
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
          
          // Play a subtle sound or just a visual hint?
          // For now, just the update is enough
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const res = await markAsRead(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const res = await markAllAsRead();
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_message': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'booking_update': return <Calendar className="w-4 h-4 text-accent-gold" />;
      default: return <Info className="w-4 h-4 text-text-secondary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/5 transition-all outline-none focus:ring-2 focus:ring-accent-gold/50 group"
      >
        <Bell className={cn(
          "h-6 w-6 transition-transform",
          isOpen ? "text-accent-gold" : "text-text-secondary group-hover:text-white"
        )} />
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white border-2 border-bg-surface">
             {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed inset-x-4 top-[80px] md:absolute md:inset-auto md:right-0 md:top-full md:mt-4 md:w-[380px] bg-bg-surface/95 backdrop-blur-2xl border border-border shadow-2xl rounded-2xl overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">Notifiche</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-bold text-accent-gold hover:text-white transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Segna tutto come letto
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-text-secondary">
                  <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nessuna notifica</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "p-4 transition-colors relative group",
                        !n.is_read ? "bg-accent-gold/5 hover:bg-accent-gold/10" : "hover:bg-white/5"
                      )}
                    >
                      {!n.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent-gold" />
                      )}
                      
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {getTypeIcon(n.type)}
                        </div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          <div className="flex items-center justify-between gap-2">
                             <h4 className="text-sm font-bold text-white leading-none truncate">{n.title}</h4>
                             <span className="text-[10px] text-text-secondary whitespace-nowrap">
                               {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: it })}
                             </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{n.content}</p>
                          
                          <div className="flex items-center gap-3 pt-1">
                            {n.link && (
                              <Link 
                                href={n.link}
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-bold text-white hover:text-accent-gold transition-colors flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" /> Vedi dettagli
                              </Link>
                            )}
                            {!n.is_read && (
                              <button 
                                onClick={() => handleMarkAsRead(n.id)}
                                className="text-[10px] font-bold text-text-secondary hover:text-success transition-colors"
                              >
                                Segna come letto
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-white/[0.01]">
                <p className="text-[9px] text-center text-text-secondary uppercase tracking-[0.2em] font-medium">Vacanze Italia Real-time Notifications</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
