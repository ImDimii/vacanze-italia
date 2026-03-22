import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { 
  Search, 
  User, 
  Home, 
  Clock,
  FileSearch
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BookingActions } from './BookingActions';

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, guest:profiles!bookings_guest_id_fkey(full_name), properties(title)')
    .order('created_at', { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'confirmed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'cancelled': return 'text-error bg-error/10 border-error/20';
      case 'receipt_uploaded': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-text-secondary bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Registro Prenotazioni</h1>
          <p className="text-text-secondary mt-1">Sola lista completa delle transazioni avvenute sulla piattaforma.</p>
        </div>
        <div className="bg-bg-surface border border-border px-4 py-2 rounded-xl flex items-center gap-2">
          <Search className="w-4 h-4 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Cerca per casa o ospite..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-text-secondary/50 w-64"
          />
        </div>
      </div>

      <Card className="bg-bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-white/[0.02]">
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest">Dettaglio Soggiorno</th>
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest">Ospite</th>
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest">Periodo</th>
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest">Prezzo Totale</th>
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest text-center">Stato</th>
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings?.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <Home className="w-5 h-5 text-accent-gold" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white tracking-tight leading-tight">{booking.properties?.title}</span>
                        {booking.receipt_url && (
                          <a href={booking.receipt_url} target="_blank" className="text-[10px] text-accent-gold flex items-center gap-1 mt-1 hover:underline">
                            <FileSearch className="w-3 h-3" /> Vedi Ricevuta
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <User className="w-3.5 h-3.5" />
                      {booking.guest?.full_name}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-white tracking-tight">€{booking.total_price}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <BookingActions bookingId={booking.id} status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!bookings || bookings.length === 0) && (
            <div className="p-12 text-center text-text-secondary bg-white/5 rounded-2xl border border-dashed border-border m-4">
              Nessuna prenotazione trovata.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
