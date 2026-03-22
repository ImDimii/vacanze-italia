import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch Stats
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: propertiesCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
  const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
  const { count: ticketsCount } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true });

  const stats = [
    { label: 'Utenti Totali', value: usersCount || 0, icon: Users, color: 'text-blue-400' },
    { label: 'Proprietà', value: propertiesCount || 0, icon: Building2, color: 'text-emerald-400' },
    { label: 'Prenotazioni', value: bookingsCount || 0, icon: CalendarCheck, color: 'text-purple-400' },
    { label: 'Ticket Aperti', value: ticketsCount || 0, icon: MessageSquare, color: 'text-orange-400' },
  ];

  // Fetch recent activity with explicit FK mapping
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('*, guest:profiles!bookings_guest_id_fkey(full_name), properties(title)')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Panoramica</h1>
        <p className="text-text-secondary mt-1">Benvenuto nel centro di controllo di VacanzeItalia.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-bg-surface border-border hover:border-accent-gold/50 transition-colors">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="bg-bg-surface border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent-gold" />
              Ultime Prenotazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentBookings?.map((booking: any) => (
                <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">{booking.properties?.title}</p>
                    <p className="text-xs text-text-secondary">Ospite: {booking.guest?.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent-gold">€{booking.total_price}</p>
                    <p className="text-[10px] uppercase text-text-secondary">{booking.status}</p>
                  </div>
                </div>
              ))}
              {(!recentBookings || recentBookings.length === 0) && (
                <div className="p-8 text-center text-text-secondary text-sm">
                  Nessuna prenotazione recente.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Shortcuts */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white tracking-tight">Azioni Rapide</h3>
          <div className="grid grid-cols-1 gap-4">
            <button className="flex items-center justify-between p-6 bg-accent-gold/10 border border-accent-gold/20 rounded-2xl hover:bg-accent-gold/20 transition-all text-left">
              <div>
                <p className="font-bold text-accent-gold">Verifica Nuove Case</p>
                <p className="text-xs text-text-secondary mt-1">Controlla le proprietà in attesa di approvazione.</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-accent-gold" />
            </button>
            <button className="flex items-center justify-between p-6 bg-white/5 border border-border rounded-2xl hover:bg-white/10 transition-all text-left">
              <div>
                <p className="font-bold text-white">Gestisci Ticket</p>
                <p className="text-xs text-text-secondary mt-1">Rispondi alle richieste di assistenza scritte dagli utenti.</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
