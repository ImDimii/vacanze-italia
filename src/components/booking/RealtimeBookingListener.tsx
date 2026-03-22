'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface RealtimeBookingListenerProps {
  bookingId?: string;
  userId?: string;
}

/**
 * Ascolta i cambiamenti della tabella 'bookings' in tempo reale e aggiorna la pagina.
 * Può filtrare per una specifica prenotazione o per tutte le prenotazioni di un utente.
 */
export function RealtimeBookingListener({ bookingId, userId }: RealtimeBookingListenerProps) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Definizione del filtro
    let filter = '';
    if (bookingId) {
      filter = `id=eq.${bookingId}`;
    }

    // Sottoscrizione al canale Realtime
    const channel = supabase
      .channel('booking_updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Ascolta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'bookings',
          filter: filter || undefined,
        },
        (payload) => {
          console.log('Booking update received:', payload);
          
          // Se stiamo ascoltando per un userId, verifichiamo che il payload appartenga all'utente
          if (userId) {
            const data = payload.new as any;
            const oldData = payload.old as any;
            const isRelevant = 
              (data && (data.guest_id === userId || data.host_id === userId)) ||
              (oldData && (oldData.guest_id === userId || oldData.host_id === userId));
            
            if (!isRelevant) return;
          }

          // Forza il refresh dei Server Components
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, userId, router, supabase]);

  return null; // Componente invisibile
}
