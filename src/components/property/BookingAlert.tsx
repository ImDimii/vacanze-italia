'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, X, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingAlertProps {
  bookingId: string;
  status: string;
  checkIn: string;
  checkOut: string;
}

export function BookingAlert({ bookingId, status, checkIn, checkOut }: BookingAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after a small delay for "wow" factor
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Prenotazione Confermata! ✅';
      case 'pending_payment': return 'Pagamento in Sospeso ⏳';
      case 'receipt_uploaded': return 'Ricevuta in Verifica 📄';
      default: return 'Hai una prenotazione attiva';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg"
        >
          <div className="bg-bg-surface/90 backdrop-blur-2xl border border-accent-gold/30 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Calendar className="w-32 h-32 text-accent-gold" />
            </div>

            <div className="bg-accent-gold/10 p-4 rounded-2xl shrink-0">
               <Bell className="w-8 h-8 text-accent-gold animate-bounce" />
            </div>

            <div className="flex-1 space-y-1 relative z-10">
               <p className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.2em] mb-1">
                 {getStatusText(status)}
               </p>
               <h3 className="text-white font-bold text-lg leading-tight">
                 Hai già prenotato questa struttura
               </h3>
               <p className="text-text-secondary text-xs">
                 Dal {new Date(checkIn).toLocaleDateString('it-IT')} al {new Date(checkOut).toLocaleDateString('it-IT')}
               </p>
               
               <div className="pt-3">
                 <Link 
                   href={`/dashboard/bookings/${bookingId}`}
                   className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent-gold transition-colors"
                 >
                   Gestisci Prenotazione <ChevronRight className="w-3 h-3" />
                 </Link>
               </div>
            </div>

            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
