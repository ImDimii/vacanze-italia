'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const MOCK_TESTIMONIALS = [
  {
    id: 'mock-1',
    profiles: { full_name: 'Marco Rossi', avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
    comment: 'Esperienza fantastica. La villa era esattamente come in foto. Host super disponibile.',
    rating: 5,
    properties: { location_city: 'Milano' }
  },
  {
    id: 'mock-2',
    profiles: { full_name: 'Giulia Bianchi', avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    comment: 'Il processo di prenotazione è stato trasparente. Nessuna commissione nascosta, tutto perfetto.',
    rating: 5,
    properties: { location_city: 'Roma' }
  },
  {
    id: 'mock-3',
    profiles: { full_name: 'Luca Fabbri', avatar_url: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
    comment: "Casa bellissima e curata nei minimi dettagli. Ritorneremo sicuramente l'anno prossimo.",
    rating: 4,
    properties: { location_city: 'Torino' }
  }
];

interface TestimonialsProps {
  reviews?: any[];
}

export function Testimonials({ reviews = [] }: TestimonialsProps) {
  const displayReviews = reviews?.length > 0 ? reviews : MOCK_TESTIMONIALS;

  return (
    <section className="py-24 bg-bg-primary overflow-hidden">
      <div className="container mx-auto px-4 mb-12 text-center">
        <h2 className="font-heading text-3xl font-bold text-white mb-4">Dicono di noi</h2>
        <p className="text-text-secondary">Le recensioni degli ospiti che hanno scelto VacanzeItalia</p>
      </div>

      <div className="flex overflow-x-auto pb-8 snap-x space-x-6 px-4 md:justify-center scrollbar-hide">
        {reviews.map((t, i) => (
          <motion.div
            key={t.id || i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="snap-center shrink-0 w-[320px]"
          >
            <Card className="bg-bg-surface border-border h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'fill-accent-gold text-accent-gold' : 'text-border'}`} />
                  ))}
                </div>
                <p className="text-text-primary italic mb-6">"{t.comment}"</p>
                <Avatar className="w-12 h-12 mb-3">
                  <AvatarImage src={t.profiles?.avatar_url} />
                  <AvatarFallback>{t.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="font-semibold text-white">{t.profiles?.full_name || 'Anonimo'}</div>
                <div className="text-sm text-text-secondary">Ha soggiornato a {t.properties?.location_city}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
