'use client';

import { motion } from 'framer-motion';
import { Search, PenTool, Euro, Key } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const steps = [
  {
    icon: Search,
    title: 'Cerca la tua casa ideale',
    description: 'Esplora migliaia di proprietà selezionate in tutta Italia.'
  },
  {
    icon: PenTool,
    title: 'Richiedi la prenotazione',
    description: 'Seleziona le date e invia la richiesta all\'host.'
  },
  {
    icon: Euro,
    title: 'Effettua il bonifico (50%)',
    description: 'Paga la caparra in modo sicuro tramite bonifico bancario.'
  },
  {
    icon: Key,
    title: 'Goditi la vacanza',
    description: 'Paga il saldo all\'arrivo e goditi il tuo soggiorno esclusivo.'
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">Come funziona</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Un processo semplice, trasparente e senza commissioni aggiuntive.
          </p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              variants={fadeInUp}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-bg-surface border border-border hover:border-accent-gold/30 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold mb-6 shadow-[0_0_20px_rgba(232,201,125,0.1)]">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-text-secondary">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
