import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import Link from 'next/link';
import { Building2, Users, ReceiptEuro, Plus, PiggyBank, CalendarClock, Wallet } from 'lucide-react';
import { startOfDay } from 'date-fns';

export const metadata = { title: 'Dashboard Host | VacanzeItalia' };

export default async function HostDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  
  // Fetch site settings for platform fee
  const { data: settings } = await supabase
    .from('site_settings')
    .select('platform_fee_pct')
    .single();
  const feePct = settings?.platform_fee_pct || 0;

  // Fetch all properties owned by user (including deleted/not published)
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('host_id', user.id);

  const safeProperties = properties || [];
  const propertyIds = safeProperties.map(p => p.id);

  // Fetch bookings for these properties using property_id link
  // (More robust than filtering by denormalized host_id)
  let safeBookings: any[] = [];
  if (propertyIds.length > 0) {
     const { data: bookings } = await supabase
      .from('bookings')
      .select('*, property:properties(title, host_id), guest:profiles!bookings_guest_id_fkey(full_name, email)')
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false });
     if (bookings) safeBookings = bookings;
  }

  const pendingReceipts = safeBookings.filter(b => b.status === 'receipt_uploaded');
  
  // Confirmed earnings (actual money received or confirmed)
  const confirmedEarnings = safeBookings
    .filter(b => ['confirmed', 'completed'].includes(b.status))
    .reduce((acc, b) => acc + (Number(b.total_price) || 0), 0);

  // Pending earnings (receipt uploaded but not confirmed yet)
  const pendingEarnings = safeBookings
    .filter(b => b.status === 'receipt_uploaded')
    .reduce((acc, b) => acc + (Number(b.total_price) || 0), 0);

  // Total turnover across all bookings (except cancelled)
  const totalTurnover = safeBookings
    .filter(b => b.status !== 'cancelled')
    .reduce((acc, b) => acc + (Number(b.total_price) || 0), 0);
  
  const netEarnings = confirmedEarnings * (1 - (Number(feePct) / 100));

  // Today at 00:00 for correct comparison
  const today = startOfDay(new Date());

  const upcomingCheckins = safeBookings
    .filter(b => {
      const checkInDate = startOfDay(new Date(b.check_in));
      return ['confirmed', 'receipt_uploaded', 'pending_payment'].includes(b.status) && checkInDate >= today;
    })
    .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Dashboard Host</h1>
          <p className="text-text-secondary">Gestisci le tue proprietà e le prenotazioni ricevute.</p>
        </div>
        <Link href="/dashboard/host/new">
          <Button className="bg-accent-gold text-black hover:bg-[#d4b568]">
            <Plus className="w-4 h-4 mr-2" />
            Nuova Proprietà
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
        <Card className="bg-bg-surface border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Totale Alloggi</CardTitle>
            <Building2 className="w-4 h-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{safeProperties.length}</div>
            <p className="text-[10px] text-text-secondary mt-1">
              {safeProperties.filter(p => p.is_published).length} Pubblicati
            </p>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Prenotazioni Totali</CardTitle>
            <Users className="w-4 h-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{safeBookings.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface border-border border-accent-gold/50 shadow-[0_0_15px_rgba(232,201,125,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-accent-gold">Da Verificare</CardTitle>
            <ReceiptEuro className="w-4 h-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-gold">{pendingReceipts.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-success">Guadagno Netto</CardTitle>
            <PiggyBank className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">€{netEarnings.toFixed(2)}</div>
            <p className="text-[10px] text-text-secondary mt-1">Al netto del {feePct}% commissioni</p>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">In Attesa</CardTitle>
            <Wallet className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">€{pendingEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-12">
        {/* Prossimi Arrivi */}
        {upcomingCheckins.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-accent-gold" />
              Prossimi Arrivi (Check-in)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingCheckins.map(b => (
                <div key={`upcoming-${b.id}`} className="bg-bg-surface border border-border hover:border-accent-gold/50 transition-colors rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white line-clamp-1">{b.property.title}</h3>
                    <div className="text-xs px-2 py-1 bg-white/5 rounded-full text-text-secondary whitespace-nowrap">
                      {new Date(b.check_in).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold font-bold">
                      {b.guest?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{b.guest?.full_name}</p>
                      <p className="text-xs text-text-secondary line-clamp-1">{b.guest?.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Da verificare */}
        {pendingReceipts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
              Ricevute in attesa di verifica
            </h2>
            <div className="grid gap-4">
              {pendingReceipts.map(b => (
                <div key={b.id} className="bg-bg-surface border border-accent-gold/30 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{b.property.title}</h3>
                    <p className="text-text-secondary text-sm">Ospite: {b.guest?.full_name} ({b.guest?.email})</p>
                    <p className="text-accent-gold font-medium mt-1">Caparra caricata: €{b.deposit_amount.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={b.receipt_url || '#'} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="border-border text-white">Vedi Ricevuta</Button>
                    </a>
                    {/* Placeholder for action buttons that would hit API */}
                    <Link href={`/dashboard/host/bookings/${b.id}`}>
                      <Button className="bg-success text-white hover:bg-success/80">Gestisci</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tutte le prenotazioni */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Tutte le prenotazioni</h2>
          <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary bg-bg-primary uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Proprietà</th>
                    <th className="px-6 py-3">Ospite</th>
                    <th className="px-6 py-3">Check-in / out</th>
                    <th className="px-6 py-3">Importo</th>
                    <th className="px-6 py-3">Stato</th>
                    <th className="px-6 py-3">Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {safeBookings.map(b => (
                    <tr key={b.id} className="border-b border-border hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{b.property.title}</td>
                      <td className="px-6 py-4 text-text-secondary">{b.guest?.full_name}</td>
                      <td className="px-6 py-4 text-text-secondary text-nowrap">
                        {new Date(b.check_in).toLocaleDateString()} <br/> {new Date(b.check_out).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">€{b.total_price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="px-6 py-4">
                         <Link href={`/dashboard/host/bookings/${b.id}`}>
                           <Button variant="ghost" className="text-text-secondary hover:text-white hover:bg-white/10" size="sm">Dettagli</Button>
                         </Link>
                      </td>
                    </tr>
                  ))}
                   {safeBookings.length > 0 && (
                     <tr className="bg-white/5 font-bold border-t-2 border-border">
                       <td colSpan={3} className="px-6 py-4 text-right text-text-secondary">TOTALE LORDO:</td>
                       <td className="px-6 py-4 text-accent-gold text-lg">€{totalTurnover.toFixed(2)}</td>
                       <td colSpan={2} className="px-6 py-4"></td>
                     </tr>
                   )}
                   {safeBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">Nessuna prenotazione trovata.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
