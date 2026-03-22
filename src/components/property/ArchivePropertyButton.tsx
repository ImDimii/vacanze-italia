'use client';

import { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { archiveProperty } from '@/app/actions/property';

export function ArchivePropertyButton({ propertyId }: { propertyId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm("Sei sicuro di voler eliminare/archiviare questo annuncio?\nServizi, recensioni e prenotazioni in corso saranno mantenuti al sicuro, ma l'annuncio non sarà più visibile sulle ricerche di VacanzeItalia.")) {
      startTransition(async () => {
        const res = await archiveProperty(propertyId);
        if (!res.success) {
          alert(res.error || 'Si è verificato un errore durante l\'eliminazione.');
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isPending} 
      title="Archivia / Elimina"
      className="flex-shrink-0 w-9 h-9 border border-error/50 rounded-xl text-error bg-error/10 hover:bg-error/20 flex items-center justify-center outline-none disabled:opacity-50 transition-colors"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Trash2 className="w-4 h-4 shrink-0" />}
    </button>
  );
}
