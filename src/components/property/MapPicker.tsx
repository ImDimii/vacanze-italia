'use client';

import { useState, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onChange: (lat: number, lng: number) => void;
}

export function MapPicker({ initialLat, initialLng, onChange }: MapPickerProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  const [marker, setMarker] = useState({
    latitude: initialLat || 41.9028, // Roma default
    longitude: initialLng || 12.4964
  });

  const onMapClick = useCallback((event: any) => {
    const { lng, lat } = event.lngLat;
    setMarker({ longitude: lng, latitude: lat });
    onChange(lat, lng);
  }, [onChange]);

  if (!mapboxToken) return <div className="p-4 bg-error/10 text-error rounded-xl text-xs">Mappa disabilitata: chiave mancante.</div>;

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-border mt-4">
      <Map
        initialViewState={{
          longitude: marker.longitude,
          latitude: marker.latitude,
          zoom: 13
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        onClick={onMapClick}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <Marker 
          longitude={marker.longitude} 
          latitude={marker.latitude} 
          draggable
          onDragEnd={(evt) => {
            const { lng, lat } = evt.lngLat;
            setMarker({ longitude: lng, latitude: lat });
            onChange(lat, lng);
          }}
        >
          <MapPin className="w-8 h-8 text-accent-gold fill-accent-gold/20 animate-bounce" />
        </Marker>
      </Map>
    </div>
  );
}
