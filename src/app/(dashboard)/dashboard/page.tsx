import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { ArchivePropertyButton } from '@/components/property/ArchivePropertyButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Image from 'next/image';
import { HostRequestButton } from '@/components/dashboard/HostRequestButton';
import { Home, Calendar, Heart, User, Plus, LayoutDashboard, Settings, Info, Trash2 } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { cn } from '@/lib/utils';
import { RealtimeBookingListener } from '@/components/booking/RealtimeBookingListener';

export const metadata = { title: 'Dashboard | VacanzeItalia' };

export default async function GuestDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const resolvedParams = await searchParams;
  const currentView = resolvedParams.view || 'overview';

  // Fetch Profile for role/host_status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch Favorites if in profile view
  let favorites: any[] = [];
  if (currentView === 'profile') {
    const { data: favs } = await supabase
      .from('favorites')
      .select(`
        id,
        property:properties (
          *,
          host:profiles!properties_host_id_fkey(*)
        )
      `)
      .eq('user_id', user.id);
    favorites = favs || [];
  }

  // 1. Prenotazioni fatte dall'utente (Guest)
  const { data: guestBookings } = await supabase
    .from('bookings')
    .select('*, property:properties(title, location_city, cover_image, images)')
    .eq('guest_id', user.id)
    .order('created_at', { ascending: false });

  const { data: hostBookings } = await supabase
    .from('bookings')
    .select('*, property:properties(title, location_city, cover_image, images), guest:profiles!bookings_guest_id_fkey(full_name)')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false });

  const safeGuestBookings = guestBookings || [];
  const safeHostBookings = hostBookings || [];
  
  const isApprovedHost = profile?.host_status === 'approved' || profile?.role === 'admin';
  const isPendingHost = profile?.host_status === 'pending';

  const { data: myProperties } = isApprovedHost 
    ? await supabase.from('properties').select('*').eq('host_id', user.id).order('created_at', { ascending: false })
    : { data: [] };

  const pendingCount = safeGuestBookings.filter(b => b.status === 'pending_payment').length;
  const toApproveCount = safeHostBookings.filter(b => b.status === 'receipt_uploaded').length;

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <RealtimeBookingListener userId={user.id} />
      {/* Header Dashboard Minimal */}
      <div className="bg-bg-surface border-b border-border mb-8">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-heading font-bold text-white mb-2">
                {currentView === 'overview' ? (
                  <>Ciao, {profile?.full_name?.split(' ')[0] || 'Utente'} <span className="text-accent-gold ml-2">👋</span></>
                ) : (
                  'Impostazioni Account'
                )}
              </h1>
              <p className="text-text-secondary">
                {currentView === 'overview' 
                  ? 'Bentornato nella tua dashboard personale di VacanzeItalia.' 
                  : 'Gestisci il tuo profilo, i tuoi preferiti e la sicurezza.'}
              </p>
            </div>
            {isApprovedHost && currentView === 'overview' && (
              <Link href="/dashboard/host/new">
                <Button className="bg-accent-gold text-black hover:bg-[#d4b568] px-6 py-6 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-accent-gold/10">
                  <Plus className="w-5 h-5" /> Pubblica Proprietà
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar / Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-bg-surface border-border overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-bg-primary border-2 border-accent-gold/30 flex items-center justify-center relative overflow-hidden">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-text-secondary" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">{profile?.full_name || 'Utente'}</h2>
                    <p className="text-xs text-text-secondary mt-1 px-3 py-1 bg-white/5 rounded-full inline-block">
                      {profile?.role === 'admin' ? 'Amministratore' : isApprovedHost ? 'Host Verificato' : 'Ospite'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-1">
                  <Link 
                    href="/dashboard?view=overview" 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                      currentView === 'overview' ? "bg-accent-gold/10 text-accent-gold" : "text-text-secondary hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link 
                    href="/dashboard?view=profile" 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                      currentView === 'profile' ? "bg-accent-gold/10 text-accent-gold" : "text-text-secondary hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <User className="w-5 h-5" /> Il mio Profilo
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Status Host Box */}
            {!isApprovedHost && currentView === 'overview' && (
              <Card className="bg-bg-surface border-border overflow-hidden border-l-4 border-l-accent-gold">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Home className="w-4 h-4 text-accent-gold" /> Diventa Host
                  </h3>
                  <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                    Hai una casa vacanze? Pubblicala su VacanzeItalia e inizia a ricevere prenotazioni dirette senza commissioni.
                  </p>
                  {isPendingHost ? (
                    <div className="w-full bg-white/5 text-text-secondary p-4 rounded-xl text-center text-sm font-medium border border-white/10">
                      ⌛ Richiesta in fase di verifica...
                    </div>
                  ) : (
                    <HostRequestButton />
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentView === 'profile' ? (
              <ProfileForm initialData={profile || {}} favorites={favorites} />
            ) : (
              <div className="space-y-12">
                {/* Sezione Viaggi */}
                <section>
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-3">
                      <Calendar className="text-accent-gold w-6 h-6" /> I Miei Viaggi
                    </h2>
                    {pendingCount > 0 && (
                      <div className="bg-warning/20 border border-warning/50 text-warning px-4 py-1.5 rounded-full text-xs font-bold animate-pulse">
                        PAGAMENTO PENDENTE ({pendingCount})
                      </div>
                    )}
                  </div>

                  {safeGuestBookings.length === 0 ? (
                    <div className="bg-bg-surface/50 border border-border border-dashed rounded-2xl p-16 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center mb-6 text-2xl">🏖️</div>
                      <h3 className="text-xl font-bold text-white mb-2">Ancora nessun viaggio?</h3>
                      <p className="text-text-secondary text-sm max-w-xs mb-8">Esplora le nostre destinazioni esclusive e prenota il tuo prossimo soggiorno in Italia.</p>
                      <Link href="/search">
                        <Button variant="outline" className="border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-black rounded-xl px-8">Inizia a Esplorare</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {safeGuestBookings.map((booking) => (
                        <Card key={booking.id} className="bg-bg-surface border-border overflow-hidden group hover:border-accent-gold/40 transition-all duration-300">
                          <div className="flex items-center p-4 gap-4 h-full">
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden shrink-0 bg-black">
                              <Image 
                                src={booking.property.cover_image || booking.property.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600'}
                                alt={booking.property.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex flex-col justify-between flex-1 py-1 overflow-hidden h-full">
                              <div>
                                <div className="flex flex-col xl:flex-row xl:justify-between items-start mb-1 gap-2.5">
                                  <h3 className="font-bold text-white text-lg line-clamp-1">{booking.property.title}</h3>
                                  <div className="shrink-0">
                                    <BookingStatusBadge status={booking.status} />
                                  </div>
                                </div>
                                <p className="text-text-secondary text-sm flex items-center gap-1.5 mb-3 font-medium">
                                    <Info className="w-4 h-4 text-accent-gold/70" /> {booking.property.location_city}
                                </p>
                                
                                <div className="text-xs font-bold text-text-primary bg-bg-primary px-3 py-2 rounded-xl border border-border/50 inline-flex items-center gap-2 mb-2 w-max shadow-inner">
                                  <span>{format(new Date(booking.check_in), 'dd MMM')} <span className="text-text-secondary font-normal mx-1">&rarr;</span> {format(new Date(booking.check_out), 'dd MMM', { locale: it })}</span>
                                </div>
                              </div>
                              <Link href={`/dashboard/bookings/${booking.id}`} className="mt-1 text-xs font-bold text-accent-gold hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 w-max">
                                Dettagli Prenotazione <span className="text-base opacity-70 ml-0.5">&rsaquo;</span>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>

                {/* Sezione Host (Solo se Approved o Admin) */}
                {isApprovedHost && (
                  <section className="pt-10 border-t border-border">
                    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                      <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-3">
                        🏠 Gestione Host
                      </h2>
                      {toApproveCount > 0 && (
                        <div className="bg-success text-black px-4 py-1.5 rounded-full text-xs font-bold animate-pulse shadow-lg shadow-success/20">
                          DA VERIFICARE ({toApproveCount})
                        </div>
                      )}
                    </div>

                    {safeHostBookings.length === 0 ? (
                      <div className="bg-bg-surface/50 border border-border border-dashed rounded-2xl p-12 text-center">
                        <p className="text-text-secondary text-sm">Non hai ancora ricevuto prenotazioni per le tue proprietà.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {safeHostBookings.map((booking) => (
                          <Card key={booking.id} className="bg-bg-surface border-border overflow-hidden hover:border-success/30 transition-all duration-300">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-bold text-white text-lg">{booking.property.title}</h3>
                                    <p className="text-text-secondary text-xs mt-1">Ospite: <span className="text-white font-medium">{booking.guest?.full_name || 'Utente'}</span></p>
                                  </div>
                                  <BookingStatusBadge status={booking.status} />
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-bg-primary rounded-xl border border-border mb-4">
                                  <div className="text-xs">
                                    <span className="text-text-secondary block mb-1 uppercase tracking-wider">Date</span>
                                    <span className="font-bold text-white">{format(new Date(booking.check_in), 'dd MMM')} - {format(new Date(booking.check_out), 'dd MMM', { locale: it })}</span>
                                  </div>
                                  <div className="text-right text-xs">
                                    <span className="text-text-secondary block mb-1 uppercase tracking-wider">Guadagno</span>
                                    <span className="font-bold text-success text-base">€{booking.total_price.toFixed(2)}</span>
                                  </div>
                                </div>

                                <Link href={`/dashboard/bookings/${booking.id}`}>
                                  <Button 
                                    variant="outline" 
                                    className={`w-full rounded-xl py-5 ${booking.status === 'receipt_uploaded' ? 'bg-success text-black hover:bg-success/90 border-0 font-bold' : 'border-border text-white hover:bg-white/5'}`}
                                  >
                                    {booking.status === 'receipt_uploaded' ? 'Verifica Pagamento' : 'Gestisci'}
                                  </Button>
                                </Link>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-8 flex justify-center">
                        <Link href="/dashboard/host">
                            <Button variant="ghost" className="text-text-secondary hover:text-white flex items-center gap-2">
                                Gestisci tutte le prenotazioni &rarr;
                            </Button>
                        </Link>
                    </div>
                  </section>
                )}

                {/* Sezione I Miei Annunci (Solo Host) */}
                {isApprovedHost && (
                  <section className="pt-10 border-t border-border">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-3">
                        🏢 I Miei Annunci
                      </h2>
                    </div>

                    {(() => {
                      const activeProps = myProperties?.filter((p: any) => p.status !== 'deleted') || [];
                      const archivedProps = myProperties?.filter((p: any) => p.status === 'deleted') || [];
                      
                      return (
                        <>
                          {activeProps.length === 0 ? (
                            <div className="bg-bg-surface/50 border border-border border-dashed rounded-2xl p-12 text-center">
                              <p className="text-text-secondary text-sm">Non hai ancora pubblicato nessuna proprietà attiva.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {activeProps.map((prop: any) => (
                                <Card key={prop.id} className="bg-bg-surface border-border overflow-hidden group hover:border-accent-gold/40 transition-all flex flex-col">
                                  <div className="relative aspect-video w-full shrink-0">
                                    <Image 
                                      src={prop.cover_image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600'} 
                                      alt={prop.title} 
                                      fill 
                                      className="object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.is_published ? 'bg-success text-black' : 'bg-warning text-black'}`}>
                                         {prop.is_published ? 'ONLINE' : 'BOZZA'}
                                       </span>
                                    </div>
                                  </div>
                                  <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-bold text-white truncate text-sm mb-1">{prop.title}</h3>
                                    <p className="text-text-secondary text-xs mb-4 flex-1">{prop.location_city}</p>
                                    <div className="flex items-center gap-2 mt-auto">
                                      <Link href={`/dashboard/host/edit/${prop.id}`} className="flex-[2] min-w-0">
                                          <Button variant="outline" className="w-full text-xs h-9 border-border hover:bg-white/5 text-white bg-bg-primary px-1">Modifica</Button>
                                      </Link>
                                      <Link href={`/property/${prop.id}`} className="flex-1 min-w-0">
                                          <Button variant="ghost" className="w-full text-xs h-9 text-text-secondary hover:text-white px-1">Vedi</Button>
                                      </Link>
                                      <ArchivePropertyButton propertyId={prop.id} />
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}

                          {archivedProps.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-border">
                              <h3 className="font-bold text-text-secondary mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Annunci Archiviati / Eliminati
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                                {archivedProps.map((prop: any) => (
                                  <Card key={prop.id} className="bg-bg-surface border-border overflow-hidden">
                                    <div className="relative aspect-video w-full">
                                      <Image 
                                        src={prop.cover_image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600'} 
                                        alt={prop.title} 
                                        fill 
                                        className="object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-bold text-[10px] uppercase tracking-widest bg-black/60 px-2 py-1 rounded">Archiviato</span>
                                      </div>
                                    </div>
                                    <div className="p-3">
                                      <h3 className="font-bold text-text-secondary truncate text-xs mb-1 line-through">{prop.title}</h3>
                                      <Link href={`/property/${prop.id}`} className="mt-2 block">
                                        <Button variant="ghost" className="w-full text-[10px] h-7 text-text-secondary hover:text-white">Vedi scheda limitata</Button>
                                      </Link>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
