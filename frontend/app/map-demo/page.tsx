'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { WorldMapDemo } from '@/components/map/WorldMapDemo';
import apiClient from '@/lib/api/client';

interface Stats {
  totalTrips: number;
  totalDistanceKm: number;
  countriesVisited: number;
  totalCarbonKg: number;
}

export default function MapDemoPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiClient.get('/stats/demo').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Countries Visited', value: stats ? String(stats.countriesVisited) : '—' },
    { label: 'Trips Logged',      value: stats ? String(stats.totalTrips)       : '—' },
    { label: 'Distance Tracked',  value: stats ? `${Math.round(stats.totalDistanceKm).toLocaleString()} km` : '—' },
    { label: 'Carbon Footprint',  value: stats ? `${Math.round(stats.totalCarbonKg).toLocaleString()} kg` : '—' },
  ];

  return (
    <div
      className="min-h-screen px-4 py-5 md:px-8 md:py-8"
      style={{ background: 'linear-gradient(180deg, #f7f4ec 0%, #efe7da 100%)', fontFamily: 'Georgia, serif' }}
    >
      <div className="mx-auto max-w-[1500px]">

        {/* Top nav */}
        <div
          className="mb-6 flex items-center justify-between rounded-[24px] border px-5 py-4 md:px-7"
          style={{ background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(180,150,100,0.2)', boxShadow: '0 10px 24px rgba(85,60,30,0.06)', backdropFilter: 'blur(4px)' }}
        >
          <div className="flex items-center gap-4">
            <div className="relative h-[64px] w-[64px] md:h-[76px] md:w-[76px]">
              <Image src="/images/logo.png" alt="My World Footprint logo" fill className="object-contain" priority />
            </div>
            <div>
              <h1 className="m-0 text-[22px] md:text-[28px]" style={{ color: '#5b3926' }}>Demo Travel Map</h1>
              <p className="m-0 text-[13px] md:text-[14px]" style={{ color: '#8b6a46', fontFamily: 'Arial, sans-serif' }}>
                Explore a sample travel footprint
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="rounded-full px-5 py-2.5 text-[15px]"
              style={{ background: 'transparent', color: '#7a5738', border: '1px solid rgba(170,140,95,0.28)', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full px-5 py-2.5 text-[15px] text-[#f7f2e8]"
              style={{ background: 'linear-gradient(180deg, #b5792a 0%, #8d5a1f 100%)', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">

          {/* Sidebar */}
          <aside
            className="rounded-[28px] border p-5"
            style={{ background: 'rgba(255,250,242,0.72)', borderColor: 'rgba(180,150,100,0.2)', boxShadow: '0 12px 28px rgba(85,60,30,0.08)' }}
          >
            <p className="mb-4 text-[13px] uppercase tracking-[1.5px]" style={{ color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>
              Demo Travel Recap
            </p>

            <div className="space-y-3">
              {statCards.map(card => (
                <div key={card.label} className="rounded-[18px] p-4" style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(190,175,145,0.22)' }}>
                  <p className="m-0 text-[13px] uppercase tracking-[1.2px]" style={{ color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>{card.label}</p>
                  <p className="mt-2 mb-0 text-[28px]" style={{ color: '#5c3b26' }}>{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/auth/signup"
                className="rounded-[18px] px-5 py-4 text-[18px] text-[#f7f2e8] transition-transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(180deg, #b5792a 0%, #8d5a1f 58%, #a36b24 100%)', border: '1px solid rgba(123,79,25,0.35)', textDecoration: 'none', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 16px rgba(80,50,20,0.12)', textAlign: 'center' }}
              >
                Start Tracking Your Trips
              </Link>
              <Link
                href="/recap-demo"
                className="rounded-[18px] px-5 py-4 text-[18px] transition-transform hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.78)', color: '#6b4b2f', border: '1px solid rgba(180,150,100,0.25)', textDecoration: 'none', textAlign: 'center' }}
              >
                View Full Recap
              </Link>

              {/* Plan adventure button + demo disclaimer */}
              <div>
                <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(160,120,240,0.2), transparent)', marginBottom: 12 }} />
                <Link
                  href="/plan"
                  className="rounded-[14px] transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(18,12,38,0.9)', border: '1px solid rgba(150,110,230,0.28)', textDecoration: 'none', boxShadow: '0 4px 16px rgba(80,40,160,0.14)', color: '#c8b0ff', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px' }}
                >
                  <span style={{ fontSize: 20, filter: 'drop-shadow(0 0 6px rgba(200,176,255,0.5))' }}>✦</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#d4c4ff' }}>Plan a Future Adventure</div>
                    <div style={{ fontSize: 11, color: 'rgba(200,176,255,0.4)', marginTop: 2, fontFamily: 'Arial, sans-serif' }}>Budget · Duration · AI itinerary</div>
                  </div>
                  <span style={{ color: 'rgba(200,176,255,0.35)', fontSize: 16 }}>→</span>
                </Link>
                <p style={{ margin: '8px 6px 0', fontSize: 11, color: '#9b7a4d', fontFamily: 'Arial, sans-serif', lineHeight: 1.5 }}>
                  * Suggestions are based on demo data, not your trips.{' '}
                  <Link href="/auth/signup" style={{ color: '#b5792a', textDecoration: 'underline' }}>Sign up</Link>{' '}
                  for personalised recommendations.
                </p>
              </div>
            </div>
          </aside>

          {/* Map panel */}
          <section
            className="rounded-[30px] border p-4 md:p-5"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.12))', borderColor: 'rgba(180,150,100,0.18)', boxShadow: '0 18px 45px rgba(45,28,12,0.12), inset 0 1px 0 rgba(255,255,255,0.18)' }}
          >
            <div
              className="mb-4 flex items-center justify-between rounded-[18px] px-4 py-3"
              style={{ background: 'rgba(255,250,242,0.68)', border: '1px solid rgba(180,150,100,0.18)' }}
            >
              <div>
                <h2 className="m-0 text-[22px]" style={{ color: '#5b3926' }}>Globe View</h2>
                <p className="m-0 mt-1 text-[14px]" style={{ color: '#8b6a46', fontFamily: 'Arial, sans-serif' }}>
                  Visualize travel routes and visited regions
                </p>
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-[26px] border"
              style={{ borderColor: 'rgba(255,255,255,0.18)', background: '#0c1224', boxShadow: '0 20px 45px rgba(30,20,10,0.18), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              <div className="relative h-[68vh] min-h-[540px] w-full md:h-[74vh] md:min-h-[640px]">
                <WorldMapDemo />
              </div>
              <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 70px rgba(255,255,255,0.02)' }} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
