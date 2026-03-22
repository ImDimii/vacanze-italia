'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Trash2, CheckCircle2, Loader2, ExternalLink, Star } from 'lucide-react';
import { togglePropertyPublish, deleteProperty, togglePropertyFeatured } from '@/app/actions/admin';
import Link from 'next/link';

interface PropertyActionsProps {
  propertyId: string;
  isPublished: boolean;
  isFeatured: boolean;
}

export function PropertyActions({ propertyId, isPublished, isFeatured }: PropertyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleTogglePublish = async () => {
    setLoading('publish');
    const result = await togglePropertyPublish(propertyId, isPublished);
    if (!result.success) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setLoading(null);
  };

  const handleToggleFeatured = async () => {
    setLoading('featured');
    const result = await togglePropertyFeatured(propertyId, isFeatured);
    if (!result.success) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm('Eliminare definitivamente questa proprietà? L\'azione non è reversibile.')) return;
    
    setLoading('delete');
    const result = await deleteProperty(propertyId);
    if (!result.success) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleToggleFeatured}
        disabled={loading !== null}
        className={cn(
          "p-3 rounded-xl transition-all disabled:opacity-50",
          isFeatured ? "text-accent-gold bg-accent-gold/10" : "text-text-secondary hover:text-accent-gold hover:bg-white/5"
        )}
        title={isFeatured ? "Rimuovi dai Vetrina" : "Metti in Vetrina"}
      >
        {loading === 'featured' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className={`w-5 h-5 ${isFeatured ? "fill-accent-gold" : ""}`} />}
      </button>
      <button 
        onClick={handleTogglePublish}
        disabled={loading !== null}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50",
          isPublished 
            ? "bg-white/5 text-text-secondary hover:bg-white/10" 
            : "bg-accent-gold text-black hover:bg-white"
        )}
      >
        {loading === 'publish' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPublished ? (
          <><EyeOff className="w-4 h-4" /> Nascondi</>
        ) : (
          <><CheckCircle2 className="w-4 h-4" /> Approva</>
        )}
      </button>
      
      <button 
        onClick={handleDelete}
        disabled={loading !== null}
        className="p-3 text-text-secondary hover:text-error hover:bg-error/10 rounded-xl transition-all disabled:opacity-50"
      >
        {loading === 'delete' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
      </button>
    </div>
  );
}

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
