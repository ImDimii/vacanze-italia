import { createClient } from '@/lib/supabase/server';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SearchResults } from '@/components/search/SearchResults';
import { MapWrapper } from '@/components/search/MapWrapper';
import { SearchContent } from '@/components/search/SearchContent';

export const metadata = {
  title: 'Cerca Case Vacanza | VacanzeItalia',
  description: 'Trova e prenota la tua prossima casa vacanza in Italia.'
};

export default async function SearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  
  let query = supabase
    .from('properties')
    .select('*, profiles!host_id(full_name, avatar_url)')
    .eq('is_published', true)
    .neq('status', 'deleted');

  // Apply filters
  if (searchParams.city && typeof searchParams.city === 'string') {
    query = query.ilike('location_city', `%${searchParams.city}%`);
  }
  
  if (searchParams.min_price && typeof searchParams.min_price === 'string') {
    query = query.gte('price_per_night', Number(searchParams.min_price));
  }
  
  if (searchParams.max_price && typeof searchParams.max_price === 'string') {
    query = query.lte('price_per_night', Number(searchParams.max_price));
  }
  
  if (searchParams.guests && typeof searchParams.guests === 'string') {
    query = query.gte('max_guests', Number(searchParams.guests));
  }

  if (searchParams.category && typeof searchParams.category === 'string') {
    query = query.eq('category_id', searchParams.category);
  }

  if (searchParams.bedrooms && typeof searchParams.bedrooms === 'string') {
    query = query.gte('bedrooms', Number(searchParams.bedrooms));
  }

  if (searchParams.bathrooms && typeof searchParams.bathrooms === 'string') {
    query = query.gte('bathrooms', Number(searchParams.bathrooms));
  }

  if (searchParams.amenities) {
    const amenitiesArr = Array.isArray(searchParams.amenities) 
      ? searchParams.amenities 
      : [searchParams.amenities];
    // Supabase can filter by array contents using 'contains'
    query = query.contains('amenities', amenitiesArr);
  }

  const { data: properties, error } = await query;
  
  let safeProperties = properties || [];

  // Filter by date availability if check_in/check_out provided
  if (searchParams.check_in && searchParams.check_out && typeof searchParams.check_in === 'string' && typeof searchParams.check_out === 'string') {
    const checkInStr = searchParams.check_in;
    const checkOutStr = searchParams.check_out;
    
    // 1. Fetch all bookings that overlap with these dates
    const { data: busyBookings } = await supabase
      .from('bookings')
      .select('property_id')
      .not('status', 'in', '("cancelled", "refunded")')
      .or(`check_in.lt.${checkOutStr},check_out.gt.${checkInStr}`);
    
    // 2. Fetch all manual blocks in this range
    const { data: busyBlocked } = await supabase
      .from('blocked_dates')
      .select('property_id')
      .gte('date', checkInStr)
      .lt('date', checkOutStr);
    
    const busyIds = new Set([
      ...(busyBookings?.map(b => b.property_id) || []),
      ...(busyBlocked?.map(b => b.property_id) || [])
    ]);
    
    if (busyIds.size > 0) {
      safeProperties = safeProperties.filter(p => !busyIds.has(p.id));
    }
  }

  // Fetch categories for the FilterPanel
  const { data: categories } = await supabase.from('categories').select('*');

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 flex flex-col h-[calc(100dvh-65px)] overflow-hidden">
      <div className="mb-4 md:mb-6 shrink-0 z-10">
        <SearchBar initialParams={searchParams} />
      </div>
      
      <SearchContent 
        properties={safeProperties} 
        categories={categories || []} 
        city={searchParams.city as string} 
      />
    </div>
  );
}
