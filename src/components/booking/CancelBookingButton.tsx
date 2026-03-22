'use client';

import { useState, useTransition } from 'react';
import { Ban, Loader2 } from 'lucide-react';
import { cancelBooking } from '@/app/actions/booking';
import { CancelBookingModal } from './CancelBookingModal';

export function CancelBookingButton({ bookingId, status }: { bookingId: string, status: string }) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCancelClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCancel = (refundInfo?: string) => {
    startTransition(async () => {
      const res = await cancelBooking(bookingId, refundInfo);
      if (!res.success) {
        alert(res.error || 'Errore imprevisto durante la disdetta.');
        setIsModalOpen(false);
      } else {
        setIsModalOpen(false);
      }
    });
  };

  const requiresRefund = ['confirmed', 'receipt_uploaded'].includes(status);
  const isRequestPending = status === 'cancellation_requested';

  return (
    <>
      <button 
        onClick={handleCancelClick}
        disabled={isPending || isRequestPending}
        className="mt-6 flex items-center justify-center gap-2 w-full px-5 py-3 border border-error/40 text-error bg-error/10 hover:bg-error/20 hover:border-error/60 rounded-xl text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-50 outline-none"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Ban className="w-4 h-4 shrink-0" />}
        {isRequestPending ? 'Annullamento in attesa di approvazione' : 'Cancella Prenotazione'}
      </button>

      <CancelBookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isPending={isPending}
        requiresRefundInfo={requiresRefund}
      />
    </>
  );
}
