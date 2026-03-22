'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export function CompleteBookingAction({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!window.confirm("Confermi di aver ricevuto il saldo e che il soggiorno è completato?")) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/receipts/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, status: 'completed' })
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Errore durante l'aggiornamento");
      }
    } catch (err) {
      alert("Errore di rete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleComplete} 
      disabled={loading}
      className="w-full bg-success hover:bg-success/80 text-white h-12 text-base font-bold mt-4"
    >
      <CheckCircle className="w-5 h-5 mr-2" />
      {loading ? 'Aggiornamento...' : 'Segna come Pagato & Completato'}
    </Button>
  );
}
