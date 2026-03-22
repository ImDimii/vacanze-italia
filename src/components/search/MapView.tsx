'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Home } from 'lucide-react';

export function MapView({ properties }: { properties: any[] }) {
  const router = useRouter();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  // Center on first property if available, else center on Italy
  const initialCenter = properties.length > 0 && properties[0].location_lat && properties[0].location_lng
    ? { longitude: properties[0].location_lng, latitude: properties[0].location_lat, zoom: 12 }
    : { longitude: 12.5, latitude: 41.9, zoom: 5 };

  const [viewState, setViewState] = useState(initialCenter);

  if (!mapboxToken || mapboxToken === 'pk.mapbox...') {
    return (
      <div className="w-full h-full bg-bg-primary flex flex-col items-center justify-center p-6 text-center text-text-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('https://maps.wikimedia.org/osm-intl/6/33/23.png')" }} />
        <div className="relative z-10 p-6 bg-bg-surface/90 backdrop-blur rounded-2xl border border-white/10 max-w-sm">
          <Home className="w-12 h-12 mx-auto mb-4 text-accent-gold opacity-50" />
          <p className="font-semibold text-white mb-2">Mappa non disponibile</p>
          <p className="text-sm">Configura NEXT_PUBLIC_MAPBOX_TOKEN in .env.local per abilitare la mappa immersiva.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        {properties.map((prop) => (
          prop.location_lat && prop.location_lng && (
            <Marker
              key={prop.id}
              longitude={prop.location_lng}
              latitude={prop.location_lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                router.push(`/property/${prop.id}`);
              }}
            >
              <div 
                className="bg-accent-gold text-black px-2 py-1 rounded-full font-bold shadow-lg text-sm cursor-pointer hover:scale-110 hover:bg-white transition-all border border-black/10 active:scale-95 z-50 pointer-events-auto"
              >
                €{prop.price_per_night}
              </div>
            </Marker>
          )
        ))}
      </Map>
    </div>
  );
}
