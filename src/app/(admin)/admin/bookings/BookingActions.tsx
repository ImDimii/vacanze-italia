'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, CheckCircle, X, Loader2 } from 'lucide-react';
import { deleteBooking, updateBookingStatus } from '@/app/actions/admin';

interface BookingActionsProps {
  bookingId: string;
  status: string;
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare definitivamente questa prenotazione dal database?')) return;
    
    setLoading('delete');
    const result = await deleteBooking(bookingId);
    if (!result.success) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setLoading(null);
  };

  const handleStatusUpdate = async (newStatus: string, label: string) => {
    if (newStatus === 'cancelled' && !confirm(`Vuoi davvero annullare questa prenotazione?`)) return;
    
    setLoading(newStatus);
    const result = await updateBookingStatus(bookingId, newStatus);
    if (!result.success) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {status === 'receipt_uploaded' && (
        <button 
          onClick={() => handleStatusUpdate('confirmed', 'Conferma')}
          disabled={loading !== null}
          className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all disabled:opacity-50" 
          title="Conferma Pagamento"
        >
          {loading === 'confirmed' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        </button>
      )}
      
      {status !== 'cancelled' && (
        <button 
          onClick={() => handleStatusUpdate('cancelled', 'Annulla')}
          disabled={loading !== null}
          className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-50" 
          title="Annulla Prenotazione"
        >
          {loading === 'cancelled' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        </button>
      )}

      <button 
        onClick={handleDelete}
        disabled={loading !== null}
        className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-all disabled:opacity-50" 
        title="Elimina dal DB"
      >
        {loading === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
