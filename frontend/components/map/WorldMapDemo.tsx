'use client';

import { useEffect, useState } from 'react';
import { WorldMap } from './WorldMap';
import type { Trip } from '@/lib/api/trips';
import apiClient from '@/lib/api/client';
import { resolveTripsRoutes } from '@/lib/map/resolveRoutes';

export function WorldMapDemo() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Trip[]>('/trips/demo')
      .then((res) => resolveTripsRoutes(res.data, process.env.NEXT_PUBLIC_MAPBOX_TOKEN!))
      .then((enriched) => setTrips(enriched))
      .catch(() => setError('Failed to load demo trips'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-vintage-cream rounded-2xl">
        <p className="text-vintage-brown font-serif text-lg">Loading demo trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-vintage-cream rounded-2xl">
        <p className="text-red-500 font-serif text-lg">{error}</p>
      </div>
    );
  }

  return <WorldMap trips={trips} heatPreset="demo" />;
}
