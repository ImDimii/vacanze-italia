import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { 
  MessageSquare, 
  Search, 
  User, 
  Mail, 
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreVertical,
  Reply
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { updateTicketStatus } from '@/app/actions/admin';

export default async function AdminTicketsPage() {
  const supabase = await createClient();
  
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'text-text-secondary bg-white/5 border-white/10';
      case 'in_progress': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-accent-gold bg-accent-gold/10 border-accent-gold/20';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Centro Supporto</h1>
          <p className="text-text-secondary mt-1">Gestisci le richieste di assistenza e i messaggi degli utenti.</p>
        </div>
        <div className="bg-bg-surface border border-border px-4 py-2 rounded-xl flex items-center gap-2">
          <Search className="w-4 h-4 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Cerca per email o oggetto..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-text-secondary/50 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tickets?.map((ticket: any) => (
          <Card key={ticket.id} className="bg-bg-surface border-border overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Status & Meta */}
                <div className="md:w-64 p-6 space-y-4 shrink-0 bg-white/[0.01]">
                   <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusColor(ticket.status)}`}>
                        {ticket.status || 'open'}
                      </span>
                      <span className="text-[10px] text-text-secondary font-medium">#{ticket.id.slice(0, 8)}</span>
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-white font-bold tracking-tight">
                        <User className="w-4 h-4 text-accent-gold" />
                        {ticket.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Mail className="w-4 h-4" />
                        {ticket.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Clock className="w-4 h-4" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                   </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 space-y-4">
                   <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white tracking-tight">{ticket.subject}</h3>
                      <p className="text-sm text-text-primary px-4 py-3 bg-white/5 rounded-xl border border-white/5 leading-relaxed">
                        {ticket.message}
                      </p>
                   </div>
                </div>

                {/* Actions */}
                <div className="md:w-48 p-6 flex flex-col justify-center gap-3 shrink-0">
                   <form action={async () => {
                     'use server';
                     const nextStatus = ticket.status === 'open' ? 'in_progress' : 'closed';
                     await updateTicketStatus(ticket.id, nextStatus);
                   }}>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all">
                        {ticket.status === 'open' ? <Reply className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {ticket.status === 'open' ? 'Gestisci' : 'Chiudi'}
                      </button>
                   </form>

                   {ticket.status !== 'closed' && (
                     <form action={async () => {
                       'use server';
                       await updateTicketStatus(ticket.id, 'closed');
                     }}>
                        <button className="w-full text-xs font-bold text-text-secondary hover:text-white transition-colors">
                          Segna come risolto
                        </button>
                     </form>
                   )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!tickets || tickets.length === 0) && (
          <div className="p-12 text-center text-text-secondary bg-white/5 rounded-3xl border border-dashed border-border">
            Ottimo lavoro! Non ci sono ticket aperti.
          </div>
        )}
      </div>
    </div>
  );
}
