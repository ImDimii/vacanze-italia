'use client';

import { useState, useTransition } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { approveCancellation } from '@/app/actions/booking';

export function ApproveCancellationAction({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleApprove = () => {
    if (!confirm('Sei sicuro di voler approvare l\'annullamento? Questa azione è irreversibile e dovrai poi procedere al rimborso manuale se dovuto.')) return;
    
    startTransition(async () => {
      const res = await approveCancellation(bookingId);
      if (!res.success) {
        setError(res.error || 'Errore durante l\'approvazione');
      }
    });
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="w-full py-4 bg-error text-white font-bold rounded-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-error/20"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Approva Annullamento
          </>
        )}
      </button>
      {error && <p className="text-error text-xs mt-2 text-center font-medium">{error}</p>}
    </div>
  );
}
