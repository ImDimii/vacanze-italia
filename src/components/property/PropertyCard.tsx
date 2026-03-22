'use client';

import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { toggleFavorite } from '@/app/actions/favorites';

export interface PropertyCardProps {
  id: string;
  title: string;
  city: string;
  country: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  initialIsFavorite?: boolean;
}

export function PropertyCard({
  id,
  title,
  city,
  country,
  pricePerNight,
  rating,
  reviewCount,
  imageUrls,
  initialIsFavorite = false
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic update
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    
    const result = await toggleFavorite(id);
    if (!result.success) {
      // Rollback on error
      setIsFavorite(!nextState);
      alert(result.error || 'Errore durante il salvataggio dei preferiti');
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group relative flex flex-col gap-3"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-bg-surface border border-border">
        {/* We would map through image urls and allow swipe here.
            For now, showing the first image. */}
        {imageUrls[0] ? (
          <Image
            src={imageUrls[0]}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-border flex items-center justify-center text-text-secondary">
            Nessuna immagine
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 rounded-full bg-black/20 hover:bg-black/40 text-white z-10"
        >
          <Heart className={cn("w-5 h-5 transition-colors", isFavorite ? "fill-error text-error" : "text-white")} />
        </Button>
      </div>

      <Link href={`/property/${id}`} className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-base md:text-lg text-text-primary line-clamp-1 truncate">
            {city}, {country}
          </h3>
          <div className="flex items-center gap-1 text-sm font-semibold text-text-primary shrink-0 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
            <Star className="w-3.5 h-3.5 fill-accent-gold text-accent-gold" />
            <span>{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
          </div>
        </div>
        
        <p className="text-text-secondary text-xs md:text-sm truncate opacity-80">{title}</p>
        
        <div className="flex items-center gap-1 mt-1">
          <span className="font-bold text-white text-base md:text-lg">€{pricePerNight}</span>
          <span className="text-text-secondary text-xs md:text-sm">notte</span>
        </div>
      </Link>
    </motion.div>
  );
}
