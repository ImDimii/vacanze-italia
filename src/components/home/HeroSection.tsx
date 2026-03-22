'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function HeroSection() {
  const router = useRouter();
  const [city, setCity] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(city.trim()) {
      router.push(`/search?city=${encodeURIComponent(city.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <section className="relative h-[85vh] sm:h-[90vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/50 via-bg-primary/70 to-bg-primary" />
      
      <div className="container relative z-10 px-4 flex flex-col items-center justify-center text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl space-y-8"
        >
          <motion.h1 
            variants={fadeInUp}
            className="font-heading text-5xl md:text-7xl font-bold text-text-primary leading-tight"
          >
            Trova il tuo <span className="text-accent-gold italic">rifugio perfetto</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto"
          >
            Case vacanze esclusive in tutta Italia. Prenota in modo sicuro, senza commissioni online.
          </motion.p>
          
          <motion.form 
            variants={fadeInUp}
            onSubmit={handleSearch}
            className="mt-6 md:mt-10 p-1.5 md:p-2 bg-bg-card/80 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-full flex flex-col md:flex-row items-stretch md:items-center shadow-2xl max-w-2xl mx-auto gap-2 md:gap-0"
          >
            <div className="flex-1 flex items-center pl-4 pr-2">
              <Search className="w-5 h-5 text-text-secondary mr-2 shrink-0" />
              <Input
                type="text"
                placeholder="Dove vuoi andare?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-text-secondary h-10 md:h-12 text-base md:text-lg w-full"
              />
            </div>
            <Button type="submit" size="lg" className="rounded-xl md:rounded-full bg-accent-gold text-black hover:bg-[#d4b568] h-11 md:h-12 px-8 text-sm md:text-base font-bold">
              Cerca
            </Button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}
