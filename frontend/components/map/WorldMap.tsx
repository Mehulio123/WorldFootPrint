'use client';

import { useRef } from 'react';
import MapGL, { Marker, Layer, Source } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Trip } from '@/lib/api/trips';

interface WorldMapProps {
  trips: Trip[];
}

export function WorldMap({ trips }: WorldMapProps) {
  const mapRef = useRef<MapRef>(null);

  // Build GeoJSON lines from all segments across all trips
  const routeData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: trips.flatMap((trip) =>
      trip.segments.map((seg) => ({
        type: 'Feature' as const,
        properties: { tripTitle: trip.title, mode: seg.transportMode },
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [seg.origin.longitude, seg.origin.latitude],
            [seg.destination.longitude, seg.destination.latitude],
          ],
        },
      }))
    ),
  };

  // Deduplicate city markers by name
  const cityMap = new Map<string, { name: string; latitude: number; longitude: number }>();
  trips.forEach((trip) => {
    trip.segments.forEach((seg) => {
      cityMap.set(seg.origin.name, seg.origin);
      cityMap.set(seg.destination.name, seg.destination);
    });
  });
  const cities = Array.from(cityMap.values());

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg">
      <MapGL
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.5,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
      >
        {/* Route lines */}
        <Source id="routes" type="geojson" data={routeData}>
          <Layer
            id="route-layer"
            type="line"
            paint={{
              'line-color': '#B8935C',
              'line-width': 2,
              'line-opacity': 0.8,
            }}
          />
        </Source>

        {/* City markers */}
        {cities.map((city) => (
          <Marker
            key={city.name}
            longitude={city.longitude}
            latitude={city.latitude}
          >
            <div className="relative">
              <div className="w-3 h-3 bg-vintage-brown rounded-full border-2 border-white shadow-lg" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-semibold text-vintage-brown-darker bg-white px-2 py-1 rounded shadow">
                  {city.name}
                </span>
              </div>
            </div>
          </Marker>
        ))}
      </MapGL>
    </div>
  );
}
