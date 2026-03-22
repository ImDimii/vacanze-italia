'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sendMessage, markAsRead } from '@/app/actions/message';
import { format, isToday, isYesterday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Send, User, Loader2, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface BookingChatProps {
  bookingId: string;
  currentUserId: string;
  initialMessages: any[];
}

export function BookingChat({ bookingId, currentUserId, initialMessages }: BookingChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    scrollToBottom();
    markAsRead(bookingId);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel(`booking_chat_${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Se non lo abbiamo già (evita doppi se l'azione revalida)
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender_id !== currentUserId) {
             markAsRead(bookingId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, currentUserId, supabase]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const content = newMessage;
    setNewMessage('');
    setLoading(true);

    const result = await sendMessage(bookingId, content);
    if (!result.success) {
      alert('Errore nell\'invio del messaggio');
      setNewMessage(content);
    }
    setLoading(false);
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Oggi';
    if (isYesterday(date)) return 'Ieri';
    return format(date, 'd MMMM yyyy', { locale: it });
  };

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach((msg) => {
    const dateKey = format(new Date(msg.created_at), 'yyyy-MM-dd');
    if (!groupedMessages[dateKey]) groupedMessages[dateKey] = [];
    groupedMessages[dateKey].push(msg);
  });

  return (
    <div className="flex flex-col h-[500px] bg-bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-border bg-bg-primary/50 flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
           Chat con l'Host
        </h3>
        <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Real-time</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
      >
        {Object.keys(groupedMessages).map((dateKey) => (
          <div key={dateKey} className="space-y-6">
            <div className="flex justify-center">
              <span className="bg-bg-primary/80 text-[10px] font-black text-text-secondary px-3 py-1 rounded-full uppercase tracking-widest border border-white/5 backdrop-blur-sm">
                {formatDateLabel(dateKey)}
              </span>
            </div>
            {groupedMessages[dateKey].map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "relative p-4 rounded-2xl shadow-lg",
                    isMe 
                      ? "bg-accent-gold text-black rounded-tr-none font-medium" 
                      : "bg-bg-primary border border-border text-white rounded-tl-none"
                  )}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <div className={cn(
                      "mt-2 flex items-center gap-1 text-[9px] font-bold opacity-60",
                      isMe ? "justify-end text-black" : "justify-start text-text-secondary"
                    )}>
                      {format(new Date(msg.created_at), 'HH:mm')}
                      {isMe && (
                         msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-bg-primary/80 border-t border-border backdrop-blur-md">
        <div className="flex gap-2 relative">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={loading}
            placeholder="Scrivi un messaggio..."
            className="flex-1 bg-bg-surface border border-border text-white rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/40 transition-all placeholder:text-text-secondary/50 pr-12"
          />
          <button 
            type="submit" 
            disabled={loading || !newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent-gold text-black rounded-xl flex items-center justify-center hover:bg-white transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
