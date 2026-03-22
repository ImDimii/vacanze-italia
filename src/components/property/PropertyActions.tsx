'use client';

import { useState, useTransition } from 'react';
import { Share2, Heart, Loader2 } from 'lucide-react';
import { toggleFavorite } from '@/app/actions/favorites';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PropertyActionsProps {
  propertyId: string;
  title: string;
  initialIsFavorite: boolean;
  isLoggedIn: boolean;
}

export function PropertyActions({ propertyId, title, initialIsFavorite, isLoggedIn }: PropertyActionsProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `VacanzeItalia: ${title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiato negli appunti!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const handleSave = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Optimistic UI update
    setIsFavorite(!isFavorite);

    startTransition(async () => {
      const result = await toggleFavorite(propertyId);
      if (!result.success) {
        // Revert on error
        setIsFavorite(isFavorite);
        console.error(result.error);
        alert(result.error || 'Errore durante il salvataggio.');
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleShare}
        className="flex items-center gap-2 px-5 py-3 border border-border rounded-xl text-xs font-bold hover:bg-white/5 transition-all outline-none active:scale-95"
      >
        <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Condividi</span>
      </button>
      
      <button 
        onClick={handleSave}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all outline-none",
          isFavorite ? "bg-accent-gold text-black shadow-lg shadow-accent-gold/20" : "bg-white text-black hover:scale-105",
          isPending && "opacity-70 pointer-events-none"
        )}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-black" />
        ) : (
          <Heart className={cn("w-4 h-4", isFavorite ? "fill-black" : "fill-transparent")} />
        )}
        <span className="hidden sm:inline">{isFavorite ? 'Salvato' : 'Salva'}</span>
      </button>
    </div>
  );
}
