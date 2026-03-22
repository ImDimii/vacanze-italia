'use client';

import { motion } from 'framer-motion';
import { Waves, Mountain, Building2, Home, Droplets, TreePine, Crown, Tag } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

const CATEGORIES = [
  { name: 'Mare', slug: 'mare', icon: Waves },
  { name: 'Montagna', slug: 'montagna', icon: Mountain },
  { name: 'Città', slug: 'citta', icon: Building2 },
  { name: 'Villa', slug: 'villa', icon: Home },
  { name: 'Lago', slug: 'lago', icon: Droplets },
  { name: 'Campagna', slug: 'campagna', icon: TreePine },
  { name: 'Lusso', slug: 'lusso', icon: Crown },
  { name: 'Economico', slug: 'economico', icon: Tag },
];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (activeCategory === value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams, activeCategory]
  );

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex justify-center space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.slug;
          
          return (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={cat.slug}
              onClick={() => router.push(`/search?${createQueryString('category', cat.slug)}`)}
              className={cn(
                "snap-start flex flex-col items-center justify-center min-w-[100px] h-24 rounded-2xl border transition-all duration-300",
                isActive 
                  ? "bg-accent-gold/10 border-accent-gold text-accent-gold shadow-[0_0_20px_rgba(232,201,125,0.15)]" 
                  : "bg-bg-surface border-border text-text-secondary hover:border-white/20 hover:text-white"
              )}
            >
              <Icon className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">{cat.name}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
