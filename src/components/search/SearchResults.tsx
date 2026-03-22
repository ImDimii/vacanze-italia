import { PropertyCard } from '@/components/property/PropertyCard';

export function SearchResults({ properties }: { properties: any[] }) {
  if (properties.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-bg-surface border border-border rounded-2xl">
        <h3 className="text-2xl font-bold text-white mb-2">Nessun risultato</h3>
        <p className="text-text-secondary">Prova a modificare i filtri o la destinazione per trovare più case vacanza.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
      {properties.map((prop) => (
        <PropertyCard
          key={prop.id}
          id={prop.id}
          title={prop.title}
          city={prop.location_city}
          country={prop.location_country}
          pricePerNight={prop.price_per_night}
          rating={prop.rating_avg}
          reviewCount={prop.review_count}
          imageUrls={prop.images || []}
        />
      ))}
    </div>
  );
}
