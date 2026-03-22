'use client';

import dynamic from 'next/dynamic';

// Carica MapView dinamicamente solo lato client per evitare problemi di SSR con Mapbox/react-map-gl
const MapViewDynamic = dynamic(
  () => import('./MapView').then((mod) => mod.MapView),
  { ssr: false }
);

export function MapWrapper(props: { properties: any[] }) {
  return <MapViewDynamic {...props} />;
}
