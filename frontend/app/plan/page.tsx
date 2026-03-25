'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tripsApi } from '@/lib/api/trips';
import { resolveTripsRoutes } from '@/lib/map/resolveRoutes';
import { TripPlanner } from '@/components/TripPlanner';

export default function PlanPage() {
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      // No auth — show planner with empty visited list
      setLoading(false);
      return;
    }

    tripsApi
      .getAll()
      .then((trips) => resolveTripsRoutes(trips, process.env.NEXT_PUBLIC_MAPBOX_TOKEN!))
      .then((enriched) => {
        // Collect unique country names from all segment origins and destinations
        const countries = new Set<string>();
        enriched.forEach((trip) =>
          trip.segments.forEach((seg) => {
            if (seg.origin.countryName)      countries.add(seg.origin.countryName);
            if (seg.destination.countryName) countries.add(seg.destination.countryName);
          })
        );
        setVisitedCountries(Array.from(countries));
      })
      .catch(() => {
        // Failed to load trips — still show the planner
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0c1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: 'rgba(245,222,179,0.4)', fontFamily: 'Georgia, serif', fontSize: 16 }}>
          Loading your travel history...
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Back nav */}
      <div style={{
        position: 'fixed', top: 16, left: 16, zIndex: 50,
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(13,12,26,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(240,160,48,0.2)', borderRadius: 50,
          padding: '7px 16px', color: 'rgba(245,222,179,0.6)',
          fontSize: 13, textDecoration: 'none', transition: 'color 0.15s',
        }}>
          ← Back
        </Link>
      </div>

      <TripPlanner
        visitedCountries={visitedCountries}
        visitedCount={visitedCountries.length}
      />
    </div>
  );
}
