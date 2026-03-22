import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { BookingTimeline } from '@/components/booking/BookingTimeline';
import { PaymentInstructions } from '@/components/booking/PaymentInstructions';
import { ReceiptUploader } from '@/components/booking/ReceiptUploader';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { Confetti } from '@/components/booking/Confetti';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Image from 'next/image';
import { Star, MapPin, User, Home, Bed, Bath, ShieldCheck, ChevronRight, Share2, Heart, Info, Mail, Phone, CheckCircle, CreditCard, XCircle } from 'lucide-react';
import { LeaveReviewForm } from '@/components/reviews/LeaveReviewForm';
import { ReceiptVerificationActions } from '@/components/host/ReceiptVerificationActions';
import { CompleteBookingAction } from '@/components/host/CompleteBookingAction';
import { CancelBookingButton } from '@/components/booking/CancelBookingButton';
import { ApproveCancellationAction } from '@/components/host/ApproveCancellationAction';
import { RealtimeBookingListener } from '@/components/booking/RealtimeBookingListener';
import { BookingChat } from '@/components/booking/BookingChat';
import { getMessages } from '@/app/actions/message';

export default async function BookingDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, property:properties(*, host:profiles!properties_host_id_fkey(*)), guest:profiles!bookings_guest_id_fkey(*)')
    .eq('id', params.id)
    .single();

  if (error || !booking || (booking.guest_id !== user.id && booking.host_id !== user.id)) {
    notFound();
  }

  const isPending = booking.status === 'pending_payment';
  const showConfetti = isPending;

  const initialMessages = await getMessages(booking.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <RealtimeBookingListener bookingId={booking.id} />
      {showConfetti && <Confetti />}
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
            {isPending ? 'Prenotazione richiesta! 🎉' : 'Dettagli prenotazione'}
          </h1>
          <p className="text-text-secondary">Codice prenotazione: <span className="font-mono text-white">{booking.id.split('-')[0]}</span></p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <BookingTimeline status={booking.status} />
          
          {/* Real-time Chat Section */}
          <div className="mt-8">
            <BookingChat 
              bookingId={booking.id} 
              currentUserId={user.id} 
              initialMessages={initialMessages} 
            />
          </div>
          
          {isPending && (
            <>
              <PaymentInstructions 
                amount={booking.deposit_amount}
                iban={booking.property.host.iban || 'IT60 X054 2811 1010 0000 0123 456'}
                bankHolder={booking.property.host.bank_holder || 'Mario Rossi (Test)'}
                bankName={booking.property.host.bank_name || 'Banca Intesa (Test)'}
                bookingId={booking.id}
                propertyTitle={booking.property.title}
                dates={`${format(new Date(booking.check_in), 'dd/MM')} - ${format(new Date(booking.check_out), 'dd/MM/yyyy')}`}
              />
              
              <ReceiptUploader 
                bookingId={booking.id} 
                expectedAmount={booking.deposit_amount} 
              />
            </>
          )}

          {booking.status === 'receipt_uploaded' && booking.guest_id === user.id && (
            <div className="bg-bg-surface border border-border p-8 rounded-2xl text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ricevuta in verifica</h3>
              <p className="text-text-secondary">
                L'host sta verificando il tuo pagamento. Riceverai un'email di conferma non appena il bonifico sarà accreditato.
              </p>
            </div>
          )}

          {booking.status === 'receipt_uploaded' && booking.host_id === user.id && (
            <div className="bg-bg-surface border border-accent-gold/50 p-6 md:p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="text-accent-gold" /> Azioni Host: Verifica Pagamento
              </h3>
              <p className="text-text-secondary mb-6">
                L'ospite ha caricato la ricevuta del bonifico. Verifica l'accredito prima di confermare.
              </p>
              
              {booking.receipt_url && (
                <div className="mb-6">
                  <a href={booking.receipt_url} target="_blank" rel="noreferrer" className="text-accent-gold underline text-sm hover:text-white transition-colors">
                    📄 Vedi Ricevuta Caricata
                  </a>
                </div>
              )}

              <ReceiptVerificationActions bookingId={booking.id} />
            </div>
          )}

          {/* SEZIONI PER L'OSPITE */}
          {booking.guest_id === user.id && (
            <div className="space-y-8 mt-8">
              {/* Notifica Richiesta Annullamento */}
              {booking.status === 'cancellation_requested' && (
                <div className="bg-amber-600/10 border border-amber-600/30 p-6 rounded-2xl flex items-start gap-4 shadow-lg shadow-amber-600/5">
                  <Info className="text-amber-600 shrink-0 w-6 h-6 mt-1" />
                  <div>
                    <h4 className="text-white font-bold mb-1">Richiesta di annullamento inviata</h4>
                    <p className="text-text-secondary text-sm">
                      La tua richiesta è in attesa di approvazione da parte dell'host. Riceverai una notifica non appena sarà elaborata.
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Posizione Esatta (Solo se confermata) */}
              {booking.status === 'confirmed' && (
                <div className="bg-bg-surface border border-accent-gold/20 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <MapPin className="w-24 h-24 text-accent-gold" />
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                       <MapPin className="text-accent-gold w-5 h-5" /> Posizione Esatta
                    </h3>
                    <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                      La tua prenotazione è confermata! Ecco l'indirizzo esatto e la vista stradale per aiutarti ad arrivare a destinazione.
                    </p>
                  </div>

                  <div className="bg-bg-primary/50 border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.2em]">Indirizzo</p>
                      <p className="text-white font-medium">{booking.property.location_address}, {booking.property.location_city}</p>
                    </div>
                    
                    {booking.property.location_lat && booking.property.location_lng && (
                      <a 
                        href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${booking.property.location_lat},${booking.property.location_lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white text-black hover:bg-neutral-200 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95 shrink-0"
                      >
                        <img src="https://www.google.com/images/branding/product/2x/maps_96dp.png" alt="Google Maps" className="w-4 h-4 shrink-0" />
                        Apri Street View
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Contatta l'Host */}
              {booking.property.host && booking.status !== 'cancelled' && (
                <div className="bg-bg-surface border border-white/5 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Mail className="w-40 h-40 text-accent-gold" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                    <Mail className="text-accent-gold w-5 h-5" /> Contatta l'Host
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm relative z-10">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                          <span className="text-text-secondary text-xs uppercase tracking-widest font-bold">Host</span>
                          <span className="text-white font-medium text-lg">{booking.property.host.full_name || 'Il tuo Host'}</span>
                      </div>
                      <div className="flex flex-col gap-1 p-4 bg-white/5 rounded-2xl border border-white/5 transition-colors">
                          <span className="text-text-secondary text-xs uppercase tracking-widest font-bold mb-1">Email di Contatto</span>
                          <a href={`mailto:${booking.property.host.email}`} className="text-white font-bold text-lg hover:text-accent-gold transition-colors flex items-center gap-2">
                            <Mail className="w-5 h-5 opacity-50 text-accent-gold" /> {booking.property.host.email || 'info@vacanzeitalia.it'}
                          </a>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-8">
                      <div className="flex flex-col gap-1">
                          <span className="text-text-secondary text-xs uppercase tracking-widest font-bold">Telefono</span>
                          {booking.property.host.phone ? (
                            <a href={`tel:${booking.property.host.phone}`} className="text-accent-gold font-bold text-lg hover:underline underline-offset-4 flex items-center gap-2">
                              <Phone className="w-4 h-4" /> {booking.property.host.phone}
                            </a>
                          ) : (
                            <span className="text-text-secondary italic">Nessun numero fornito</span>
                          )}
                      </div>
                      {booking.property.host.phone && (
                        <a 
                          href={`https://wa.me/${booking.property.host.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Ciao, sono ${booking.guest?.full_name || 'un ospite'}, ho una prenotazione (n. ${booking.id.split('-')[0]}) per ${booking.property.title}. Vorrei avere maggiori informazioni...`
                          )}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full py-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#25D366] hover:bg-[#25D366] hover:text-black transition-all"
                        >
                          Scrivi su WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Lascia una recensione */}
              {['confirmed', 'completed'].includes(booking.status) && (
                <div className="bg-bg-surface border border-accent-gold/20 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Star className="w-40 h-40 text-accent-gold fill-accent-gold/5" />
                  </div>
                  <LeaveReviewForm bookingId={booking.id} propertyId={booking.property_id} />
                </div>
              )}
            </div>
          )}

          {/* SEZIONI PER L'HOST */}
          {booking.host_id === user.id && (
            <div className="space-y-8 mt-8">
              {/* Azioni Host: Approvazione Annullamento */}
              {booking.status === 'cancellation_requested' && (
                <div className="bg-bg-surface border border-error/50 p-6 md:p-8 rounded-2xl shadow-xl shadow-error/5">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <XCircle className="text-error w-6 h-6" /> Azioni Host: Richiesta Annullamento
                  </h3>
                  <p className="text-text-secondary mb-4 text-sm leading-relaxed">
                    L'ospite ha richiesto di annullare la prenotazione. Per procedere, approva la richiesta qui sotto. 
                  </p>
                  <p className="text-xs text-text-secondary italic mb-6">
                    Nota: Dovrai poi gestire il rimborso della caparra separatamente se già versata.
                  </p>
                  
                  <ApproveCancellationAction bookingId={booking.id} />
                </div>
              )}

              {booking.guest && (
                <div className="bg-bg-surface border border-border p-8 rounded-3xl shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle className="text-accent-gold w-5 h-5" /> Informazioni Ospite
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                          <span className="text-text-secondary text-xs uppercase tracking-widest font-bold">Nome</span>
                          <span className="text-white font-medium text-lg">{booking.guest.full_name || 'Non specificato'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                          <span className="text-text-secondary text-xs uppercase tracking-widest font-bold">Email</span>
                          <span className="text-white font-medium">{booking.guest.email || 'Non specificata'}</span>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-8">
                      <div className="flex flex-col gap-1">
                          <span className="text-text-secondary text-xs uppercase tracking-widest font-bold">Telefono</span>
                          {booking.guest.phone ? (
                            <a href={`tel:${booking.guest.phone}`} className="text-accent-gold font-bold text-lg hover:underline underline-offset-4 flex items-center gap-2">
                              <Phone className="w-4 h-4" /> {booking.guest.phone}
                            </a>
                          ) : (
                            <span className="text-text-secondary italic">Nessun numero fornito</span>
                          )}
                      </div>
                      {booking.guest.phone && (
                        <a 
                          href={`https://wa.me/${booking.guest.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#25D366] hover:brightness-110 transition-all font-mono"
                        >
                          Chat on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Rimborso (Se presente) - Visibile sia a Guest che Host */}
          {['cancelled', 'cancellation_requested'].includes(booking.status) && booking.receipt_rejection_reason?.startsWith('[REFUND]') && (
            <div className={`border p-8 rounded-3xl shadow-xl space-y-4 ${booking.guest_id === user.id ? 'bg-accent-gold/5 border-accent-gold/20' : 'bg-error/5 border-error/20'}`}>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className={`${booking.guest_id === user.id ? 'text-accent-gold' : 'text-error'} w-5 h-5`} /> Informazioni per Rimborso
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {booking.guest_id === user.id 
                  ? "Hai richiesto un rimborso con i seguenti dati. L'host procederà al bonifico il prima possibile."
                  : "L'ospite ha richiesto un rimborso indicando i seguenti dati per il bonifico:"
                }
              </p>
              <div className="bg-bg-primary/50 p-6 rounded-2xl border border-white/5 font-mono text-white text-lg break-all">
                {booking.receipt_rejection_reason.replace('[REFUND] ', '')}
              </div>
            </div>
          )}

        </div>

        <div className="space-y-6">
          <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden p-6 shadow-xl">
            <h3 className="font-heading text-xl font-bold text-white mb-4">Riepilogo</h3>
            
            <Link 
              href={`/property/${booking.property.id}`}
              className="group flex gap-4 mb-6 transition-all"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/5 group-hover:border-accent-gold/50 transition-colors">
                <Image 
                  src={booking.property.cover_image || booking.property.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200'}
                  alt={booking.property.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="font-bold text-white line-clamp-2 group-hover:text-accent-gold transition-colors">{booking.property.title}</h4>
                <div className="flex items-center text-text-secondary text-xs mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {booking.property.location_city}
                </div>
              </div>
            </Link>

            <hr className="border-border mb-6" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-text-secondary text-sm">Check-in</span>
                  <span className="text-white font-medium">{format(new Date(booking.check_in), 'dd MMM yyyy', { locale: it })}</span>
                </div>
                <div className="text-right">
                  <span className="text-text-secondary text-xs block">Dalle ore</span>
                  <span className="text-white text-sm font-bold">{booking.property.check_in_time || '15:00'}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-text-secondary text-sm">Check-out</span>
                  <span className="text-white font-medium">{format(new Date(booking.check_out), 'dd MMM yyyy', { locale: it })}</span>
                </div>
                <div className="text-right">
                  <span className="text-text-secondary text-xs block">Entro le ore</span>
                  <span className="text-white text-sm font-bold">{booking.property.check_out_time || '10:00'}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary text-sm">Ospiti</span>
                <span className="text-white font-medium">{booking.num_guests}</span>
              </div>
            </div>

            <hr className="border-border my-6" />

            <div className="space-y-2">
              <div className="flex justify-between text-white font-bold text-lg mb-4">
                <span>Totale soggiorno</span>
                <span>€{booking.total_price.toFixed(2)}</span>
              </div>
              
              <div className="bg-bg-primary rounded-xl p-4 border border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-accent-gold flex items-center gap-1">💳 Caparra versata/da versare</span>
                  <span className="font-semibold text-white">€{booking.deposit_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-success flex items-center gap-1">💵 Saldo (all'arrivo)</span>
                  <span className="font-semibold text-white">€{booking.balance_amount.toFixed(2)}</span>
                </div>
              </div>
              
              {booking.status === 'confirmed' && booking.host_id === user.id && (
                <CompleteBookingAction bookingId={booking.id} />
              )}
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold text-white mb-2">FAQ</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">Cosa succede dopo aver caricato la ricevuta?</p>
                  <p className="text-xs text-text-secondary mt-1">L'host verificherà l'importo e confermerà definitivamente la prenotazione nel sistema.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Posso cancellare?</p>
                  <p className="text-xs text-text-secondary mt-1">Sì, secondo i termini flessibili/moderati. Contatta l'host o l'assistenza per i rimborsi della caparra.</p>
                </div>
              </div>
            </div>

            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <div className="pt-2">
                <CancelBookingButton bookingId={booking.id} status={booking.status} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
