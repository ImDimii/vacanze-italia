'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Wifi, Car, Waves, Snowflake, Tv, Wind, RefreshCw, Briefcase, Sunset,
  Users, Bed, Bath, Home, ArrowRight, Filter, X, Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const UtensilsCrossed = Utensils;

const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'kitchen', label: 'Cucina', icon: UtensilsCrossed },
  { id: 'parking', label: 'Parcheggio', icon: Car },
  { id: 'pool', label: 'Piscina', icon: Waves },
  { id: 'ac', label: 'Clima', icon: Wind },
  { id: 'tv', label: 'Smart TV', icon: Tv },
  { id: 'washer', label: 'Lavatrice', icon: RefreshCw },
  { id: 'workspace', label: 'Lavoro', icon: Briefcase },
  { id: 'sea_view', label: 'Vista Mare', icon: Sunset }
];

interface FilterPanelProps {
  categories: any[];
  isMobile?: boolean;
}

export function FilterPanel({ categories = [], isMobile = false }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get('min_price')) || 50,
    Number(searchParams.get('max_price')) || 1500
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [rooms, setRooms] = useState({
    bedrooms: Number(searchParams.get('bedrooms')) || 0,
    bathrooms: Number(searchParams.get('bathrooms')) || 0,
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.getAll('amenities') || []
  );

  const applyFilters = (closeSheet?: () => void) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('min_price', priceRange[0].toString());
    params.set('max_price', priceRange[1].toString());
    
    if (selectedCategory) params.set('category', selectedCategory);
    else params.delete('category');

    if (rooms.bedrooms > 0) params.set('bedrooms', rooms.bedrooms.toString());
    else params.delete('bedrooms');

    if (rooms.bathrooms > 0) params.set('bathrooms', rooms.bathrooms.toString());
    else params.delete('bathrooms');

    params.delete('amenities');
    selectedAmenities.forEach(a => params.append('amenities', a));

    router.push(`/search?${params.toString()}`);
    if (closeSheet) closeSheet();
  };

  const clearFilters = () => {
    router.push('/search');
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const Content = ({ onSuccess }: { onSuccess?: () => void }) => (
    <div className="space-y-10 pb-10">
      {/* Categories */}
      <div className="space-y-4">
        <Label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Categoria</Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all border",
              !selectedCategory 
                ? "bg-accent-gold border-accent-gold text-black shadow-lg shadow-accent-gold/20" 
                : "bg-bg-primary/50 border-border text-text-secondary hover:border-white/20"
            )}
          >
            Tutte
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                selectedCategory === cat.id 
                  ? "bg-accent-gold border-accent-gold text-black shadow-lg shadow-accent-gold/20" 
                  : "bg-bg-primary/50 border-border text-text-secondary hover:border-white/20"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <Label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Fascia di Prezzo</Label>
          <span className="text-xs font-bold text-accent-gold">€{priceRange[0]} — €{priceRange[1]}</span>
        </div>
        <Slider 
          defaultValue={[50, 1500]} 
          max={2000} 
          step={10} 
          value={priceRange}
          onValueChange={(val) => setPriceRange(val as number[])}
          className="mt-6"
        />
      </div>

      {/* Rooms and Bathrooms */}
      <div className="space-y-4">
        <Label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Stanze e Bagni</Label>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-4 bg-bg-primary/30 border border-border rounded-xl">
             <div className="flex items-center gap-3">
                <Bed className="w-4 h-4 text-accent-gold/60" />
                <span className="text-xs font-bold text-white/80">Camere da Letto</span>
             </div>
             <div className="flex items-center gap-4">
                <button onClick={() => setRooms(r => ({ ...r, bedrooms: Math.max(0, r.bedrooms - 1) }))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-white/5 transition-colors text-white">—</button>
                <span className="text-sm font-bold text-white w-4 text-center">{rooms.bedrooms}</span>
                <button onClick={() => setRooms(r => ({ ...r, bedrooms: r.bedrooms + 1 }))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-white/5 transition-colors text-white">+</button>
             </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-bg-primary/30 border border-border rounded-xl">
             <div className="flex items-center gap-3">
                <Bath className="w-4 h-4 text-accent-gold/60" />
                <span className="text-xs font-bold text-white/80">Bagni</span>
             </div>
             <div className="flex items-center gap-4">
                <button onClick={() => setRooms(r => ({ ...r, bathrooms: Math.max(0, r.bathrooms - 1) }))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-white/5 transition-colors text-white">—</button>
                <span className="text-sm font-bold text-white w-4 text-center">{rooms.bathrooms}</span>
                <button onClick={() => setRooms(r => ({ ...r, bathrooms: r.bathrooms + 1 }))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-white/5 transition-colors text-white">+</button>
             </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <Label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Servizi</Label>
        <div className="grid grid-cols-2 gap-3">
          {AMENITIES.map(item => {
            const Icon = item.icon;
            const isSelected = selectedAmenities.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleAmenity(item.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                  isSelected 
                    ? "bg-accent-gold border-accent-gold text-black shadow-lg shadow-accent-gold/20" 
                    : "bg-bg-primary/30 border-border text-text-secondary hover:border-white/20 hover:text-white"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isSelected ? "text-black" : "text-accent-gold/40 group-hover:text-accent-gold")} />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Button onClick={() => applyFilters(onSuccess)} className="w-full h-14 bg-accent-gold text-black hover:bg-white font-bold uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-accent-gold/10 transition-all active:scale-95">
        Applica Filtri
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" className="w-full h-12 border-border bg-bg-surface text-white hover:bg-white/5 flex items-center gap-3 rounded-xl group">
               <Filter className="w-4 h-4 text-accent-gold group-hover:rotate-12 transition-transform" />
               <span className="font-bold uppercase tracking-widest text-[11px]">Filtri Avanzati</span>
            </Button>
          }
        />
        <SheetContent side="bottom" className="h-[90vh] bg-bg-surface border-t border-border rounded-t-3xl p-6 overflow-y-auto scrollbar-hide">
          <SheetHeader className="pb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-white uppercase tracking-widest">Filtra Ricerca</SheetTitle>
              <button onClick={clearFilters} className="text-xs font-bold text-error/60 hover:text-error uppercase tracking-widest">Resetta</button>
            </div>
          </SheetHeader>
          <Content />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-3xl p-8 h-full overflow-y-auto scrollbar-hide shadow-2xl">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Filtri</h3>
        <button onClick={clearFilters} className="text-[10px] font-bold text-text-secondary hover:text-error underline uppercase tracking-widest decoration-1 underline-offset-4 transition-colors">
          Resetta
        </button>
      </div>

      <Content />
    </div>
  );
}
