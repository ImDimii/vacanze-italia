import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar as CalendarIcon, Users, CreditCard } from 'lucide-react';
import { ReceiptVerificationActions } from '@/components/host/ReceiptVerificationActions';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default async function HostBookingDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, property:properties(title, location_city), guest:profiles!bookings_guest_id_fkey(*)')
    .eq('id', params.id)
    .single();

  if (error || !booking || booking.host_id !== user.id) {
    notFound();
  }

  const isPendingVerification = booking.status === 'receipt_uploaded';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/dashboard/host" className="inline-flex items-center text-accent-gold hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Torna alla dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2">
            Prenotazione per {booking.property.title}
          </h1>
          <p className="text-text-secondary">Codice: <span className="font-mono text-white">{booking.id}</span></p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-bg-surface border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-white mb-4">Dettagli del Soggiorno</h3>
              <div className="grid grid-cols-2 gap-y-6">
                <div>
                  <div className="flex items-center text-text-secondary mb-1">
                    <CalendarIcon className="w-4 h-4 mr-2" /> Check-in
                  </div>
                  <div className="font-medium text-white">{format(new Date(booking.check_in), 'dd MMM yyyy', { locale: it })}</div>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-1">
                    <CalendarIcon className="w-4 h-4 mr-2" /> Check-out
                  </div>
                  <div className="font-medium text-white">{format(new Date(booking.check_out), 'dd MMM yyyy', { locale: it })}</div>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-1">
                    <Users className="w-4 h-4 mr-2" /> Ospiti
                  </div>
                  <div className="font-medium text-white">{booking.num_guests}</div>
                </div>
                <div>
                  <div className="flex items-center text-text-secondary mb-1">
                    <CreditCard className="w-4 h-4 mr-2" /> Totale
                  </div>
                  <div className="font-medium text-white">€{booking.total_price.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bg-surface border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-white mb-4">Informazioni Ospite</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-text-secondary">Nome Completo</div>
                  <div className="font-medium text-white">{booking.guest.full_name}</div>
                </div>
                <div>
                  <div className="text-sm text-text-secondary">Email</div>
                  <div className="font-medium text-white">{booking.guest.email}</div>
                </div>
                {booking.guest.phone && (
                  <div>
                    <div className="text-sm text-text-secondary">Telefono</div>
                    <div className="font-medium text-white">{booking.guest.phone}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={`bg-bg-surface border-border overflow-hidden ${isPendingVerification ? 'border-accent-gold/50 shadow-[0_0_20px_rgba(232,201,125,0.1)]' : ''}`}>
            <div className="bg-bg-primary p-4 border-b border-border">
              <h3 className="font-bold text-white flex items-center justify-between">
                Verifica Ricevuta
                {isPendingVerification && <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />}
              </h3>
            </div>
            <CardContent className="p-6">
              {!booking.receipt_url && booking.status === 'pending_payment' ? (
                <div className="text-center py-6">
                  <p className="text-text-secondary">In attesa che l'ospite carichi la ricevuta del bonifico.</p>
                </div>
              ) : booking.receipt_url ? (
                <div className="space-y-6">
                  <div className="bg-bg-primary rounded-xl p-4 border border-border">
                    <p className="text-sm text-text-secondary mb-2">Importo atteso (50%):</p>
                    <p className="text-2xl font-bold text-accent-gold">€{booking.deposit_amount.toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-text-secondary mb-2">Ricevuta ricaricata:</p>
                    <a 
                      href={booking.receipt_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center p-4 rounded-xl border border-border bg-bg-primary hover:bg-white/5 transition-colors text-white group"
                    >
                      <span className="truncate max-w-[150px] mr-2 text-sm text-text-secondary group-hover:text-white transition-colors">Vedi documento</span>
                      <ExternalLink className="w-4 h-4 text-accent-gold" />
                    </a>
                  </div>

                  {isPendingVerification && (
                    <div className="pt-4 border-t border-border mt-4">
                      <p className="text-sm text-text-primary mb-4">Verifica che l'importo sia corretto e il bonifico sia stato accreditato.</p>
                      <ReceiptVerificationActions bookingId={booking.id} />
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="bg-success/10 border border-success/30 text-success p-4 rounded-xl text-center text-sm font-medium">
                      ✓ Ricevuta verificata e prenotazione confermata
                    </div>
                  )}

                  {booking.status === 'rejected' && (
                    <div className="bg-error/10 border border-error/30 text-error p-4 rounded-xl text-center text-sm font-medium">
                      ✕ Ricevuta rifiutata
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-text-secondary">Nessuna ricevuta disponibile.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
