'use client';

import { Copy, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { pulseGold } from '@/lib/animations';

interface PaymentInstructionsProps {
  amount: number;
  iban: string;
  bankHolder: string;
  bankName: string;
  bookingId: string;
  propertyTitle: string;
  dates: string;
}

export function PaymentInstructions({ 
  amount, 
  iban, 
  bankHolder, 
  bankName, 
  bookingId, 
  propertyTitle, 
  dates 
}: PaymentInstructionsProps) {
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const causale = `Caparra prenotazione ${bookingId.substring(0,8)} - ${propertyTitle} - ${dates}`;

  return (
    <motion.div 
      variants={pulseGold}
      animate="animate"
      className="bg-bg-surface border-2 border-accent-gold rounded-2xl p-6 lg:p-8 relative overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold shrink-0">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Istruzioni Bonifico Bancario</h3>
          <p className="text-sm text-text-secondary">Paga il 50% di caparra per confermare</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-border">
          <span className="text-text-secondary">Importo da versare:</span>
          <span className="text-2xl font-bold text-accent-gold">€{amount.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-text-secondary block mb-1">Intestatario:</span>
            <div className="font-medium text-white">{bankHolder}</div>
          </div>
          <div>
            <span className="text-sm text-text-secondary block mb-1">Banca:</span>
            <div className="font-medium text-white">{bankName}</div>
          </div>
          
          <div className="md:col-span-2">
            <span className="text-sm text-text-secondary block mb-1">IBAN:</span>
            <div className="flex items-center gap-2">
              <code className="bg-bg-primary text-accent-gold px-3 py-2 rounded-md font-mono text-lg flex-1">
                {iban}
              </code>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(iban)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <span className="text-sm text-text-secondary block mb-1">Causale (copia esattamente):</span>
            <div className="flex items-center gap-2">
              <code className="bg-bg-primary text-white px-3 py-2 rounded-md font-mono flex-1 text-sm break-all">
                {causale}
              </code>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(causale)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-error/10 border border-error/20 rounded-xl p-4 text-sm text-error text-center font-medium">
        ⚠️ La prenotazione verrà annullata se non carichi la ricevuta entro 48 ore.
      </div>
    </motion.div>
  );
}
