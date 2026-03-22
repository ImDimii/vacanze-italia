import { HeroSection } from '@/components/home/HeroSection';
import { CategoryFilter } from '@/components/home/CategoryFilter';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Testimonials } from '@/components/home/Testimonials';
import { BecomeHostBanner } from '@/components/home/BecomeHostBanner';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch up to 6 published properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*, profiles(full_name, avatar_url)')
    .eq('is_published', true)
    .neq('status', 'deleted')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);

  // Fallback se non ci sono case pubblicate: mostriamo anche quelle in bozza per far finta che ci sia contenuto
  let displayProperties = properties;
  if (!properties || properties.length === 0) {
    const { data: allProps } = await supabase
      .from('properties')
      .select('*, profiles(full_name, avatar_url)')
      .neq('status', 'deleted')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6);
    displayProperties = allProps;
  }

  const { data: latestReviews } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url), properties(location_city)')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <CategoryFilter />
      <FeaturedProperties properties={displayProperties || []} />
      <HowItWorks />
      <Testimonials reviews={latestReviews || []} />
      <BecomeHostBanner />
    </div>
  );
}
