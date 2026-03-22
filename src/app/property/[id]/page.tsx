import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PropertyCarousel } from '@/components/property/PropertyCarousel';
import { BookingWidget } from '@/components/property/BookingWidget';
import { AmenitiesGrid } from '@/components/property/AmenitiesGrid';
import { HostCard } from '@/components/property/HostCard';
import { MapWrapper } from '@/components/search/MapWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, User, Home, Bed, Bath, ShieldCheck, ChevronRight, Share2, Heart, Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { PropertyActions } from '@/components/property/PropertyActions';
import { BookingAlert } from '@/components/property/BookingAlert';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('properties').select('title').eq('id', id).single();
  return { title: data?.title ? `${data.title} | Vacanze Italia` : 'Alloggio | Vacanze Italia' };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Property
  const { data: property, error } = await supabase
    .from('properties')
    .select('*, category:categories(*), host:profiles!properties_host_id_fkey(*), seasonal_prices(*)')
    .eq('id', id)
    .single();

  if (error || !property) {
    notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (property.status === 'deleted' || !property.is_published) {
    if (!user || user.id !== property.host_id) {
      notFound();
    }
  }
  // 2. Reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
    .eq('property_id', id)
    .order('created_at', { ascending: false });

  const totalReviews = reviews?.length || 0;
  const avgRating = totalReviews > 0 
    ? (reviews || []).reduce((acc, r) => acc + r.rating, 0) / totalReviews 
    : 0.0;

  // 3. Availability (Bookings + Manual Host Blocks)
  const { data: bookings } = await supabase.from('bookings')
    .select('check_in, check_out')
    .eq('property_id', id)
    .in('status', ['confirmed', 'receipt_uploaded', 'pending_payment']);
  
  const bookingDates: Date[] = [];
  (bookings || []).forEach(b => {
    let current = new Date(b.check_in);
    const end = new Date(b.check_out);
    // Include all days in the range
    while (current < end) {
      bookingDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });

  const manualBlockedDates = (property.blocked_dates || []).map((b: any) => new Date(b.date));
  const allBlockedDates = [...bookingDates, ...manualBlockedDates];
  const allImages = [property.cover_image, ...(property.images || [])].filter(Boolean);

  let isFavorite = false;
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('property_id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (fav) isFavorite = true;
  }

  // 4. Check for active booking
  let userBooking = null;
  if (user) {
    const { data: b } = await supabase
      .from('bookings')
      .select('id, status, check_in, check_out')
      .eq('property_id', id)
      .eq('guest_id', user.id)
      .in('status', ['confirmed', 'pending_payment', 'receipt_uploaded'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (b) userBooking = b;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-white selection:bg-accent-gold selection:text-black antialiased pb-20">
      
      {userBooking && (
        <BookingAlert 
          bookingId={userBooking.id} 
          status={userBooking.status}
          checkIn={userBooking.check_in}
          checkOut={userBooking.check_out}
        />
      )}
      
      {/* Dashboard-Style Nav */}
      <div className="sticky top-0 z-40 w-full bg-bg-surface/80 backdrop-blur-xl border-b border-border py-6 px-6 md:px-12">
        <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
                <Link href="/search" className="p-3 bg-bg-primary border border-border rounded-xl hover:bg-white/5 transition-all">
                   <ChevronRight className="w-4 h-4 rotate-180" />
                </Link>
                <div className="hidden md:block">
                   <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest mb-0.5">Dettaglio Alloggio</p>
                   <h3 className="text-base font-bold text-white leading-none">{property.title}</h3>
                </div>
            </div>
            <PropertyActions 
              propertyId={property.id} 
              title={property.title} 
              initialIsFavorite={isFavorite} 
              isLoggedIn={!!user} 
            />
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-16">
        
        {/* Dashboard-Style Header */}
        <header className="mb-12">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                 <div className="px-3 py-1 bg-white/5 rounded-full inline-block text-[10px] font-bold text-accent-gold uppercase tracking-widest border border-accent-gold/20">
                    {property.category?.name}
                 </div>
                 <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight text-white leading-tight">
                    {property.title}
                 </h1>
                 <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                       <Star className="w-5 h-5 fill-accent-gold text-accent-gold" />
                       <span className="text-xl font-bold">{avgRating.toFixed(1)}</span>
                       <span className="text-text-secondary text-sm ml-1">({totalReviews} recensioni)</span>
                    </div>
                    <div className="h-4 w-px bg-border hidden sm:block" />
                    <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
                       <MapPin className="w-4 h-4 text-accent-gold" />
                       <span>{property.location_city}, {property.location_province}</span>
                    </div>
                 </div>
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
          
          <div className="space-y-16">
            
            {/* Gallery (Rounded Dashboard Style) */}
            <div className="bg-bg-surface border border-border p-4 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
               <PropertyCarousel images={allImages} />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Ospiti', value: property.max_guests, icon: User },
                { label: 'Camere', value: property.bedrooms, icon: Home },
                { label: 'Letti', value: property.beds, icon: Bed },
                { label: 'Bagni', value: property.bathrooms, icon: Bath }
              ].map((item, i) => (
                <div key={i} className="bg-bg-surface border border-border rounded-2xl p-6 text-center hover:border-accent-gold/30 transition-all group">
                  <item.icon className="w-5 h-5 text-accent-gold mx-auto mb-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <span className="block text-2xl font-bold text-white mb-1">{item.value}</span>
                  <span className="block text-[10px] text-text-secondary uppercase tracking-widest font-bold">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Description Card */}
            <div className="bg-bg-surface border border-border rounded-3xl p-10 space-y-6">
               <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Info className="w-6 h-6 text-accent-gold" /> L'Alloggio
               </h2>
               <div className="text-text-secondary leading-relaxed text-lg font-medium whitespace-pre-wrap">
                  {property.description}
               </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-bg-surface border border-border rounded-3xl p-10 space-y-10">
              <h2 className="text-2xl font-bold text-white">Servizi Inclusi</h2>
              <AmenitiesGrid amenities={property.amenities} />
            </div>

            {/* Map Card */}
            <div className="bg-bg-surface border border-border rounded-3xl p-4 space-y-6 shadow-xl shadow-black/20">
               <div className="rounded-2xl overflow-hidden h-[400px] relative">
                  <MapWrapper properties={[property]} />
                  <div className="absolute bottom-6 left-6 z-10 bg-bg-surface/90 backdrop-blur-xl border border-border p-4 rounded-xl flex items-center gap-3 shadow-2xl">
                     <MapPin className="w-5 h-5 text-accent-gold" />
                     <p className="text-xs font-bold text-white">
                        {property.location_address}, {property.location_city}
                     </p>
                  </div>
               </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-10 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold text-white">Cosa dicono gli ospiti</h2>
                <div className="px-4 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-xl text-accent-gold font-bold">
                   Media: {avgRating.toFixed(1)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(reviews || []).slice(0, 6).map((review) => (
                  <div key={review.id} className="bg-bg-surface border border-border rounded-3xl p-8 space-y-6 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-accent-gold/30 p-0.5">
                         <AvatarImage src={review.reviewer?.avatar_url} className="rounded-full" />
                         <AvatarFallback className="rounded-full bg-bg-primary font-bold text-accent-gold">{review.reviewer?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-bold text-base">{review.reviewer?.full_name}</p>
                        <p className="text-text-secondary text-xs font-medium">{format(new Date(review.created_at), 'MMMM yyyy', { locale: it })}</p>
                      </div>
                    </div>
                    <p className="text-text-secondary text-base leading-relaxed italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Combined Host Card Section */}
            <HostCard host={property.host} propertyTitle={property.title} propertyId={property.id} />

          </div>

          {/* Sidebar (Dashboard Style - Sticky) */}
          <aside className="lg:sticky lg:top-32 space-y-8">
            {property.status === 'deleted' || !property.is_published ? (
              <div className="bg-bg-surface border border-error/30 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                 <h3 className="text-lg font-bold text-error uppercase tracking-widest">Annuncio Archiviato</h3>
                 <p className="text-sm font-medium text-text-secondary leading-relaxed">
                   Questo annuncio non è attualmente attivo e non può ricevere prenotazioni. Stai visualizzando un'anteprima limitata.
                 </p>
              </div>
            ) : (
              <BookingWidget 
                property={property} 
                blockedDates={allBlockedDates} 
                avgRating={avgRating}
                totalReviews={totalReviews}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
