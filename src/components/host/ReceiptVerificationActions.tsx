'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle } from 'lucide-react';

export function ReceiptVerificationActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');

  const handleVerify = async (status: 'confirmed' | 'rejected') => {
    if (status === 'rejected' && !reason && showRejectForm) {
      alert("Specifica un motivo per il rifiuto");
      return;
    }

    if (status === 'rejected' && !showRejectForm) {
      setShowRejectForm(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/receipts/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, status, reason })
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
    <div className="space-y-4">
      {!showRejectForm ? (
        <div className="flex gap-4">
          <Button 
            onClick={() => handleVerify('confirmed')} 
            disabled={loading}
            className="flex-1 bg-success hover:bg-success/80 text-white h-12 text-base"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Approva Ricevuta
          </Button>
          <Button 
            onClick={() => handleVerify('rejected')} 
            disabled={loading}
            variant="outline"
            className="border-error text-error hover:bg-error/10 h-12"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Rifiuta
          </Button>
        </div>
      ) : (
        <div className="space-y-4 bg-error/5 p-6 rounded-xl border border-error/20">
          <h4 className="font-bold text-error">Motivazione rifiuto</h4>
          <p className="text-sm text-text-secondary">Spiega all'ospite perché la ricevuta non è valida (es. importo errato, sbiadita, IBAN non corrispondente).</p>
          <Textarea 
            value={reason} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
            className="bg-bg-primary text-white border-border"
            placeholder="Specifica il motivo..."
          />
          <div className="flex gap-4">
            <Button 
              onClick={() => handleVerify('rejected')} 
              disabled={loading}
              className="bg-error hover:bg-error/80 text-white"
            >
              Conferma Rifiuto
            </Button>
            <Button 
              onClick={() => setShowRejectForm(false)} 
              disabled={loading}
              variant="outline"
            >
              Annulla
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
