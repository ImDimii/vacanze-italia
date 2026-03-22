'use client';

import { useState } from 'react';
import { FilterPanel } from './FilterPanel';
import { SearchResults } from './SearchResults';
import { MapWrapper } from './MapWrapper';
import { Button } from '@/components/ui/button';
import { Map, List, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchContentProps {
  properties: any[];
  categories: any[];
  city?: string;
}

export function SearchContent({ properties, categories, city }: SearchContentProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative">
      <aside className="w-full md:w-[320px] shrink-0 h-full hidden md:block">
        <FilterPanel categories={categories} />
      </aside>
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-h-0 overflow-hidden relative">
        {/* List View */}
        <div className={cn(
          "flex-1 overflow-y-auto pr-2 scrollbar-hide pb-24 transition-opacity duration-300",
          viewMode === 'map' ? "hidden lg:block opacity-0 lg:opacity-100" : "opacity-100"
        )}>
          <div className="md:hidden mb-4">
            <FilterPanel categories={categories} isMobile />
          </div>

          <h1 className="text-2xl font-bold text-white mb-6 font-heading">
            {properties.length} alloggi trovati {city ? `a ${city}` : ''}
          </h1>
          <SearchResults properties={properties} />
        </div>
        
        {/* Map View */}
        <div className={cn(
          "w-full lg:w-[45%] h-full rounded-2xl overflow-hidden shadow-2xl border border-border shrink-0 transition-opacity duration-300",
          viewMode === 'list' ? "absolute inset-0 opacity-0 pointer-events-none z-0 lg:relative lg:opacity-100 lg:z-auto lg:pointer-events-auto lg:block" : "absolute inset-0 z-10 lg:relative lg:block"
        )}>
          <MapWrapper properties={properties} />
        </div>
      </div>

      {/* Floating Toggle Button (Mobile/Tablet) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 lg:hidden">
        <Button 
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="rounded-full bg-black border border-accent-gold/50 text-white hover:bg-accent-gold hover:text-black px-6 h-12 shadow-2xl shadow-black/50 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all active:scale-95"
        >
          {viewMode === 'list' ? (
            <>
              <Map className="w-4 h-4" />
              Mappa
            </>
          ) : (
            <>
              <List className="w-4 h-4" />
              Lista
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
