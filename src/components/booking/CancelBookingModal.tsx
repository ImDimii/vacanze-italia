'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CreditCard, User, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (refundInfo?: string) => void;
  isPending: boolean;
  requiresRefundInfo: boolean;
}

export function CancelBookingModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isPending, 
  requiresRefundInfo 
}: CancelBookingModalProps) {
  const [iban, setIban] = useState('');
  const [holder, setHolder] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresRefundInfo) {
      onConfirm(`IBAN: ${iban} - Intestatario: ${holder}`);
    } else {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-bg-surface border border-white/10 rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="bg-error/10 p-3 rounded-2xl">
                  <AlertTriangle className="w-8 h-8 text-error" />
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Cancella Prenotazione</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {requiresRefundInfo 
                    ? "Poiché hai già effettuato il pagamento della caparra, abbiamo bisogno dei tuoi dati bancari per procedere al rimborso."
                    : "Sei sicuro di voler cancellare la prenotazione? L'operazione non è reversibile."
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {requiresRefundInfo && (
                  <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="space-y-2">
                      <Label htmlFor="iban" className="text-xs uppercase tracking-widest font-bold text-accent-gold">IBAN per il Rimborso</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <Input 
                          id="iban"
                          required
                          placeholder="IT00 X000..."
                          value={iban}
                          onChange={(e) => setIban(e.target.value)}
                          className="pl-12 bg-bg-primary/50 border-white/10 h-12 rounded-xl focus:ring-accent-gold/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="holder" className="text-xs uppercase tracking-widest font-bold text-accent-gold">Intestatario Conto</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <Input 
                          id="holder"
                          required
                          placeholder="Nome e Cognome..."
                          value={holder}
                          onChange={(e) => setHolder(e.target.value)}
                          className="pl-12 bg-bg-primary/50 border-white/10 h-12 rounded-xl focus:ring-accent-gold/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-14 bg-error text-white font-bold rounded-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Conferma Cancellazione"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="w-full h-14 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-error/5 py-4 px-8 border-t border-error/10">
              <p className="text-[10px] text-error/70 text-center uppercase tracking-widest font-bold">
                ⚠️ L'operazione non può essere annullata
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
