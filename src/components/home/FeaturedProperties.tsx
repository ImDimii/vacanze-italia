'use client';

import { motion } from 'framer-motion';
import { PropertyCard } from '@/components/property/PropertyCard';
import { staggerContainer, fadeInUp } from '@/lib/animations';

interface FeaturedProps {
  properties: any[];
}

export function FeaturedProperties({ properties }: FeaturedProps) {
  if (!properties || properties.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="font-heading text-3xl font-bold text-white mb-2">In Evidenza</h2>
          <p className="text-text-secondary">Esplora le proprietà più amate dai nostri ospiti</p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {properties.map((prop) => (
          <motion.div variants={fadeInUp} key={prop.id}>
            <PropertyCard 
              id={prop.id}
              title={prop.title}
              city={prop.location_city}
              country={prop.location_country}
              pricePerNight={prop.price_per_night}
              rating={prop.rating_avg || 0}
              reviewCount={prop.review_count || 0}
              imageUrls={prop.cover_image ? [prop.cover_image] : (prop.images || [])}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
