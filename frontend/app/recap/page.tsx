'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

/* ─────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────── */
interface Overview {
  totalTrips: number;
  totalSegments: number;
  totalDistanceKm: number;
  totalCarbonKg: number;
  countriesVisited: number;
  citiesVisited: number;
  mostUsedTransport: string;
}
interface TransportStat {
  mode: string;
  segmentCount: number;
  totalDistanceKm: number;
  totalCarbonKg: number;
  percentOfTotal: number;
}
interface Country {
  countryCode: string;
  countryName: string;
  visitCount: number;
  cities: string[];
}
interface YearStat {
  year: number;
  trips: number;
  distanceKm: number;
  carbonKg: number;
  countries: number;
}
interface RepeatedRoute {
  origin: string;
  destination: string;
  timesTraveled: number;
  totalDistanceKm: number;
  transportModes: string[];
  avgCarbonPerTrip: number;
}
interface CarbonBreakdown {
  totalCarbonKg: number;
  byTransport: { mode: string; carbonKg: number; percentOfTotal: number }[];
  comparison: { equivalentTreesNeeded: number; equivalentCarMiles: number };
}

/* ─────────────────────────────────────────────────────
   Constants & helpers
───────────────────────────────────────────────────── */
const EARTH_KM = 40_075;
const MOON_KM = 384_400;
const WORLD_COUNTRIES = 195;

function flagEmoji(code: string) {
  if (!code || code === 'XX') return '🌐';
  return code
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

const TRANSPORT: Record<string, { emoji: string; label: string; color: string }> = {
  flight: { emoji: '✈️', label: 'Flight', color: '#b5792a' },
  car:    { emoji: '🚗', label: 'Car',    color: '#3b82f6' },
  train:  { emoji: '🚂', label: 'Train',  color: '#22c55e' },
  bus:    { emoji: '🚌', label: 'Bus',    color: '#f97316' },
  ferry:  { emoji: '⛴️', label: 'Ferry',  color: '#06b6d4' },
  bike:   { emoji: '🚲', label: 'Bike',   color: '#84cc16' },
  walk:   { emoji: '🚶', label: 'Walk',   color: '#a855f7' },
};

function tm(mode: string) {
  return TRANSPORT[mode?.toLowerCase()] ?? { emoji: '🗺️', label: mode || 'Unknown', color: '#9b7a4d' };
}

function fmt(n: number) { return n.toLocaleString(); }

/* ─────────────────────────────────────────────────────
   Small reusable components
───────────────────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 26, color: '#5b3926', margin: 0, fontFamily: 'Georgia, serif' }}>{children}</h2>
      <div style={{ width: 44, height: 3, background: 'linear-gradient(90deg, #b5792a, #d4ac68)', borderRadius: 2, marginTop: 8 }} />
    </div>
  );
}

function StatOrb({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.72)',
      border: '1px solid rgba(190,175,145,0.3)',
      borderRadius: 22,
      padding: '20px 14px',
      textAlign: 'center',
      boxShadow: '0 6px 20px rgba(85,60,30,0.07)',
    }}>
      <div style={{ fontSize: 36, fontWeight: 600, color: '#5b3926', lineHeight: 1, fontFamily: 'Georgia, serif' }}>{value}</div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.3px', color: '#9b7a4d', fontFamily: 'Arial, sans-serif', marginTop: 7 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#b5a090', fontFamily: 'Arial, sans-serif', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

const cardBase: React.CSSProperties = {
  background: 'rgba(255,250,242,0.72)',
  border: '1px solid rgba(180,150,100,0.2)',
  borderRadius: 24,
  boxShadow: '0 8px 24px rgba(85,60,30,0.07)',
};

/* ─────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────── */
export default function RecapPage() {
  const router = useRouter();
  const [loading, setLoading]               = useState(true);
  const [overview, setOverview]             = useState<Overview | null>(null);
  const [byTransport, setByTransport]       = useState<TransportStat[]>([]);
  const [countries, setCountries]           = useState<Country[]>([]);
  const [byYear, setByYear]                 = useState<YearStat[]>([]);
  const [repeatedRoutes, setRepeatedRoutes] = useState<RepeatedRoute[]>([]);
  const [carbon, setCarbon]                 = useState<CarbonBreakdown | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    Promise.all([
      apiClient.get('/stats/overview'),
      apiClient.get('/stats/by-transport'),
      apiClient.get('/stats/countries'),
      apiClient.get('/stats/by-year'),
      apiClient.get('/stats/repeated-routes'),
      apiClient.get('/stats/carbon-breakdown'),
    ]).then(([ov, tr, co, yr, rr, cb]) => {
      setOverview(ov.data);
      setByTransport(tr.data.byTransport ?? []);
      setCountries(co.data.countries ?? []);
      setByYear(yr.data.byYear ?? []);
      setRepeatedRoutes(rr.data.repeatedRoutes ?? []);
      setCarbon(cb.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  /* Loading */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #f7f4ec 0%, #efe7da 100%)', fontFamily: 'Georgia, serif' }}>
      <div style={{ textAlign: 'center', color: '#9b7a4d' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🌍</div>
        <p style={{ fontSize: 18, margin: 0 }}>Loading your travel story…</p>
      </div>
    </div>
  );

  /* No data */
  if (!overview) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #f7f4ec 0%, #efe7da 100%)', fontFamily: 'Georgia, serif' }}>
      <div style={{ textAlign: 'center', color: '#9b7a4d' }}>
        <p>Could not load your recap.{' '}
          <Link href="/trips" style={{ color: '#b5792a' }}>Add some trips first!</Link>
        </p>
      </div>
    </div>
  );

  /* ── Derived stats ── */
  const earthLaps        = overview.totalDistanceKm / EARTH_KM;
  const moonPercent      = (overview.totalDistanceKm / MOON_KM) * 100;
  const worldCoverage    = ((overview.countriesVisited / WORLD_COUNTRIES) * 100).toFixed(1);
  const avgDistPerTrip   = overview.totalTrips > 0 ? Math.round(overview.totalDistanceKm / overview.totalTrips) : 0;
  const avgCarbonPerTrip = overview.totalTrips > 0 ? Math.round(overview.totalCarbonKg / overview.totalTrips) : 0;
  const avgCarbonPerKm   = overview.totalDistanceKm > 0
    ? (overview.totalCarbonKg / overview.totalDistanceKm).toFixed(2)
    : '0.00';

  const mostVisited  = countries[0] ?? null;
  const busiestYear  = [...byYear].sort((a, b) => b.trips - a.trips)[0] ?? null;
  const maxYearDist  = Math.max(...byYear.map(y => y.distanceKm), 1);
  const maxTrDist    = Math.max(...byTransport.map(t => t.totalDistanceKm), 1);

  /* Eco modes sorted by carbon/km */
  const ecoModes = byTransport
    .filter(t => t.totalDistanceKm > 50)
    .map(t => ({ mode: t.mode, cpk: t.totalCarbonKg / t.totalDistanceKm }))
    .sort((a, b) => a.cpk - b.cpk);

  /* Travel personality */
  const flightPct = byTransport.find(t => t.mode === 'flight')?.percentOfTotal ?? 0;
  const trainPct  = byTransport.find(t => t.mode === 'train')?.percentOfTotal ?? 0;
  const carPct    = byTransport.find(t => t.mode === 'car')?.percentOfTotal ?? 0;
  const ferryPct  = byTransport.find(t => t.mode === 'ferry')?.percentOfTotal ?? 0;

  let personality = { title: 'World Wanderer', desc: 'You travel the world in your own unique way.', emoji: '🌍' };
  if (flightPct > 60)      personality = { title: 'Sky Nomad',          desc: 'The skies are your second home. Most of your journeys take place at 35,000 feet.',   emoji: '✈️' };
  else if (trainPct > 40)  personality = { title: 'Rail Adventurer',    desc: 'You prefer the scenic route — trains define your travel identity.',                   emoji: '🚂' };
  else if (carPct > 40)    personality = { title: 'Road Tripper',        desc: 'The open road calls to you. You are most at home behind the wheel.',                  emoji: '🚗' };
  else if (ferryPct > 20)  personality = { title: 'Sea Voyager',         desc: "You have a sailor's spirit — the sea is woven through your story.",                   emoji: '⛴️' };
  else if (byTransport.length >= 4) personality = { title: 'Multi-Modal Explorer', desc: 'No single mode defines you. You adapt and use every form of transport.', emoji: '🗺️' };

  /* Fun-facts array */
  const funFacts = [
    { icon: '🌏', stat: `${earthLaps.toFixed(2)}×`,      label: 'Around the Earth',      sub: `${fmt(Math.round(overview.totalDistanceKm))} km ÷ 40,075 km` },
    { icon: '🌙', stat: `${moonPercent.toFixed(1)}%`,     label: 'Distance to the Moon',  sub: `of ${fmt(MOON_KM)} km reached` },
    { icon: '🗺️', stat: `${worldCoverage}%`,              label: 'World Explored',        sub: `${overview.countriesVisited} of ${WORLD_COUNTRIES} countries` },
    { icon: '✈️', stat: fmt(overview.totalSegments),      label: 'Journey Legs',          sub: 'individual segments logged' },
    { icon: '🏙️', stat: fmt(overview.citiesVisited),      label: 'Cities Visited',        sub: 'unique destinations' },
    { icon: '📍', stat: `${fmt(avgDistPerTrip)} km`,       label: 'Avg Trip Length',       sub: 'per journey' },
    { icon: '💨', stat: `${fmt(avgCarbonPerTrip)} kg`,     label: 'Avg CO₂ per Trip',     sub: 'carbon footprint per journey' },
    { icon: '⚖️', stat: `${avgCarbonPerKm} kg/km`,        label: 'Carbon Intensity',      sub: 'across all travel' },
    ...(repeatedRoutes.length > 0
      ? [{ icon: '🔁', stat: fmt(repeatedRoutes.length),  label: 'Signature Routes',      sub: 'traveled more than once' }]
      : []),
    ...(busiestYear
      ? [{ icon: '📅', stat: String(busiestYear.year),    label: 'Busiest Year',          sub: `${busiestYear.trips} trips · ${busiestYear.countries} countries` }]
      : []),
    ...(carbon
      ? [{ icon: '🌳', stat: fmt(carbon.comparison.equivalentTreesNeeded), label: 'Trees to Offset', sub: 'absorbing for one full year' }]
      : []),
    ...(ecoModes.length > 0
      ? [{ icon: '♻️', stat: `${ecoModes[0].cpk.toFixed(2)} kg/km`, label: `Greenest: ${tm(ecoModes[0].mode).label}`, sub: 'lowest CO₂ per km of your modes' }]
      : []),
  ];

  return (
    <div style={{ background: 'linear-gradient(180deg, #f7f4ec 0%, #efe7da 100%)', minHeight: '100vh', fontFamily: 'Georgia, serif', color: '#4b2e22' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px 72px' }}>

        {/* ══ NAV ══════════════════════════════════════════ */}
        <div style={{ ...cardBase, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', marginBottom: 28, backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.55)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 62, height: 62 }}>
              <Image src="/images/logo.png" alt="logo" fill className="object-contain" priority />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, color: '#5b3926' }}>Your Travel Recap</h1>
              <p style={{ margin: 0, fontSize: 13, color: '#8b6a46', fontFamily: 'Arial, sans-serif' }}>A deep dive into how you explore the world</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/map-user" style={{ color: '#7a5738', fontSize: 14, fontFamily: 'Arial, sans-serif', textDecoration: 'none', border: '1px solid rgba(170,140,95,0.28)', borderRadius: 999, padding: '8px 18px' }}>
              ← Map
            </Link>
            <Link href="/trips" style={{ color: '#f7f2e8', fontSize: 14, fontFamily: 'Arial, sans-serif', textDecoration: 'none', background: 'linear-gradient(180deg, #b5792a 0%, #8d5a1f 100%)', borderRadius: 999, padding: '8px 18px' }}>
              Manage Trips
            </Link>
          </div>
        </div>

        {/* ══ HERO ═════════════════════════════════════════ */}
        <div style={{ ...cardBase, padding: '36px 40px', marginBottom: 24, background: 'linear-gradient(135deg, rgba(255,250,242,0.95) 0%, rgba(255,243,220,0.88) 100%)' }}>
          {/* Personality + world coverage */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '2px', color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>
                Travel Personality
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 48 }}>{personality.emoji}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 34, color: '#5b3926' }}>{personality.title}</h2>
                  <p style={{ margin: 0, fontSize: 15, color: '#8b6a46', fontFamily: 'Arial, sans-serif', maxWidth: 460, marginTop: 4 }}>
                    {personality.desc}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: 11, color: '#9b7a4d', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>World Coverage</p>
              <div style={{ fontSize: 42, color: '#b5792a', lineHeight: 1 }}>{worldCoverage}%</div>
              <div style={{ fontSize: 13, color: '#9b7a4d', fontFamily: 'Arial, sans-serif', marginTop: 4 }}>of all countries explored</div>
            </div>
          </div>

          {/* Six stat orbs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 24 }}>
            <StatOrb value={String(overview.countriesVisited)} label="Countries"     sub={`of ${WORLD_COUNTRIES} worldwide`} />
            <StatOrb value={String(overview.citiesVisited)}    label="Cities"        sub="unique destinations" />
            <StatOrb value={String(overview.totalTrips)}       label="Trips"         sub={`${overview.totalSegments} legs total`} />
            <StatOrb value={fmt(Math.round(overview.totalDistanceKm))} label="km Traveled" sub={`${earthLaps.toFixed(2)}× Earth`} />
            <StatOrb value={fmt(Math.round(overview.totalCarbonKg))} label="kg CO₂"   sub="total footprint" />
            <StatOrb value={`${fmt(avgDistPerTrip)} km`}       label="Avg / Trip"    sub="average journey" />
          </div>

          {/* Moon distance progress bar */}
          {overview.totalDistanceKm > 0 && (
            <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.5)', borderRadius: 16, border: '1px solid rgba(190,175,145,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#8b6a46', fontFamily: 'Arial, sans-serif' }}>
                  🌍 → 🌙 &nbsp;Distance to the Moon &nbsp;({fmt(Math.round(overview.totalDistanceKm))} of {fmt(MOON_KM)} km)
                </span>
                <span style={{ fontSize: 13, color: '#b5792a', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>
                  {moonPercent.toFixed(2)}%
                </span>
              </div>
              <div style={{ height: 9, background: 'rgba(180,150,100,0.14)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(moonPercent, 100)}%`, background: 'linear-gradient(90deg, #b5792a, #d4ac68)', borderRadius: 999 }} />
              </div>
            </div>
          )}
        </div>

        {/* ══ HOW YOU MOVE + QUICK CARDS ═══════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 24, alignItems: 'start' }}>

          {/* Transport breakdown */}
          <div style={{ ...cardBase, padding: '32px 36px' }}>
            <SectionTitle>How You Move</SectionTitle>
            {byTransport.length === 0 ? (
              <p style={{ color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>No transport data yet.</p>
            ) : byTransport.map(t => {
              const meta = tm(t.mode);
              const barW = (t.totalDistanceKm / maxTrDist) * 100;
              const cpk  = t.totalDistanceKm > 0 ? (t.totalCarbonKg / t.totalDistanceKm).toFixed(2) : '0.00';
              return (
                <div key={t.mode} style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{meta.emoji}</span>
                      <span style={{ fontSize: 15, color: '#5b3926', fontFamily: 'Arial, sans-serif' }}>{meta.label}</span>
                      <span style={{ fontSize: 10, color: '#9b7a4d', fontFamily: 'Arial, sans-serif', background: 'rgba(155,122,77,0.1)', borderRadius: 999, padding: '2px 8px' }}>
                        {t.segmentCount} {t.segmentCount === 1 ? 'leg' : 'legs'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 15, color: '#5b3926', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>{fmt(Math.round(t.totalDistanceKm))} km</span>
                      <span style={{ fontSize: 12, color: '#9b7a4d', fontFamily: 'Arial, sans-serif', marginLeft: 8 }}>{t.percentOfTotal}%</span>
                    </div>
                  </div>
                  <div style={{ height: 11, background: 'rgba(180,150,100,0.12)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barW}%`, background: `linear-gradient(90deg, ${meta.color}bb, ${meta.color})`, borderRadius: 999 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                    <span style={{ fontSize: 11, color: '#b5a090', fontFamily: 'Arial, sans-serif' }}>{fmt(Math.round(t.totalCarbonKg))} kg CO₂</span>
                    <span style={{ fontSize: 11, color: '#b5a090', fontFamily: 'Arial, sans-serif' }}>{cpk} kg/km</span>
                  </div>
                </div>
              );
            })}

            {ecoModes.length > 0 && (
              <div style={{ marginTop: 12, padding: '13px 16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 14 }}>
                <span style={{ fontSize: 13, color: '#166534', fontFamily: 'Arial, sans-serif' }}>
                  🌱 Most eco-friendly mode you use:{' '}
                  <strong>{tm(ecoModes[0].mode).emoji} {tm(ecoModes[0].mode).label}</strong>{' '}
                  at {ecoModes[0].cpk.toFixed(2)} kg CO₂/km
                </span>
              </div>
            )}
          </div>

          {/* Right quick-cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mostVisited && (
              <div style={{ ...cardBase, padding: '22px 22px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>
                  Most Visited Country
                </p>
                <div style={{ fontSize: 42, lineHeight: 1, marginBottom: 6 }}>{flagEmoji(mostVisited.countryCode)}</div>
                <div style={{ fontSize: 20, color: '#5b3926', marginBottom: 4 }}>{mostVisited.countryName}</div>
                <div style={{ fontSize: 13, color: '#8b6a46', fontFamily: 'Arial, sans-serif' }}>
                  {mostVisited.visitCount} visit{mostVisited.visitCount !== 1 ? 's' : ''} · {mostVisited.cities.length} cit{mostVisited.cities.length !== 1 ? 'ies' : 'y'}
                </div>
                <div style={{ fontSize: 11, color: '#b5a090', fontFamily: 'Arial, sans-serif', marginTop: 4 }}>
                  {mostVisited.cities.slice(0, 4).join(', ')}{mostVisited.cities.length > 4 ? '…' : ''}
                </div>
              </div>
            )}
            {busiestYear && (
              <div style={{ ...cardBase, padding: '22px 22px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>
                  Busiest Year
                </p>
                <div style={{ fontSize: 42, color: '#b5792a', lineHeight: 1, marginBottom: 6 }}>{busiestYear.year}</div>
                <div style={{ fontSize: 13, color: '#8b6a46', fontFamily: 'Arial, sans-serif' }}>
                  {busiestYear.trips} trips · {fmt(busiestYear.distanceKm)} km
                </div>
                <div style={{ fontSize: 11, color: '#b5a090', fontFamily: 'Arial, sans-serif', marginTop: 4 }}>
                  {busiestYear.countries} countries · {fmt(busiestYear.carbonKg)} kg CO₂
                </div>
              </div>
            )}
            <div style={{ ...cardBase, padding: '22px 22px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>
                Average Trip
              </p>
              <div style={{ fontSize: 32, color: '#5b3926', lineHeight: 1, marginBottom: 6 }}>
                {fmt(avgDistPerTrip)} <span style={{ fontSize: 14 }}>km</span>
              </div>
              <div style={{ fontSize: 13, color: '#8b6a46', fontFamily: 'Arial, sans-serif' }}>{fmt(avgCarbonPerTrip)} kg CO₂ per journey</div>
              <div style={{ fontSize: 11, color: '#b5a090', fontFamily: 'Arial, sans-serif', marginTop: 4 }}>{avgCarbonPerKm} kg CO₂ per km overall</div>
            </div>
          </div>
        </div>

        {/* ══ COUNTRIES GRID ═══════════════════════════════ */}
        <div style={{ ...cardBase, padding: '32px 36px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
            <SectionTitle>Countries You've Explored</SectionTitle>
            <span style={{ fontSize: 13, color: '#9b7a4d', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
              {overview.countriesVisited} countries · {worldCoverage}% of the world
            </span>
          </div>
          {countries.length === 0 ? (
            <p style={{ color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>No countries logged yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 12 }}>
              {countries.map((c, i) => (
                <div key={c.countryCode} style={{
                  background: i === 0
                    ? 'linear-gradient(135deg, rgba(181,121,42,0.14), rgba(212,172,104,0.08))'
                    : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${i === 0 ? 'rgba(181,121,42,0.28)' : 'rgba(190,175,145,0.2)'}`,
                  borderRadius: 16,
                  padding: '14px 15px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}>
                  <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{flagEmoji(c.countryCode)}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#5b3926', fontWeight: i === 0 ? 600 : 400, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.countryName}
                    </div>
                    <div style={{ fontSize: 11, color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>
                      {c.visitCount} {c.visitCount === 1 ? 'visit' : 'visits'} · {c.cities.length} {c.cities.length === 1 ? 'city' : 'cities'}
                    </div>
                    <div style={{ fontSize: 10, color: '#b5a090', fontFamily: 'Arial, sans-serif', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.cities.slice(0, 3).join(', ')}{c.cities.length > 3 ? '…' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══ YEAR BY YEAR ═════════════════════════════════ */}
        {byYear.length > 0 && (
          <div style={{ ...cardBase, padding: '32px 36px', marginBottom: 24 }}>
            <SectionTitle>Year by Year</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {byYear.map(y => {
                const barW     = (y.distanceKm / maxYearDist) * 100;
                const isBusiest = busiestYear && y.year === busiestYear.year;
                return (
                  <div key={y.year} style={{
                    background: isBusiest
                      ? 'linear-gradient(135deg, rgba(181,121,42,0.1), rgba(212,172,104,0.06))'
                      : 'rgba(255,255,255,0.5)',
                    border: `1px solid ${isBusiest ? 'rgba(181,121,42,0.22)' : 'rgba(190,175,145,0.18)'}`,
                    borderRadius: 18,
                    padding: '16px 20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10 }}>
                      <div style={{ minWidth: 56 }}>
                        <div style={{ fontSize: 22, color: '#5b3926', lineHeight: 1, fontWeight: isBusiest ? 600 : 400 }}>{y.year}</div>
                        {isBusiest && (
                          <div style={{ fontSize: 9, color: '#b5792a', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Arial, sans-serif', marginTop: 2 }}>
                            busiest
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 12, background: 'rgba(180,150,100,0.12)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${barW}%`, background: 'linear-gradient(90deg, #b5792a, #d4ac68)', borderRadius: 999 }} />
                        </div>
                      </div>
                      <div style={{ minWidth: 110, textAlign: 'right', fontSize: 15, color: '#5b3926', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>
                        {fmt(y.distanceKm)} km
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 24, paddingLeft: 74 }}>
                      <span style={{ fontSize: 12, color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>🧳 {y.trips} trips</span>
                      <span style={{ fontSize: 12, color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>🌍 {y.countries} countries</span>
                      <span style={{ fontSize: 12, color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>💨 {fmt(y.carbonKg)} kg CO₂</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ CARBON IMPACT ════════════════════════════════ */}
        {carbon && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

            {/* Left: headline */}
            <div style={{ ...cardBase, padding: '32px 36px', background: 'linear-gradient(135deg, rgba(240,253,244,0.92), rgba(220,252,231,0.75))' }}>
              <SectionTitle>Carbon Impact</SectionTitle>
              <div style={{ fontSize: 54, color: '#166534', lineHeight: 1, fontWeight: 600, marginBottom: 4 }}>
                {fmt(Math.round(carbon.totalCarbonKg))}
              </div>
              <div style={{ fontSize: 17, color: '#166534', fontFamily: 'Arial, sans-serif', marginBottom: 28 }}>kg of CO₂ emitted</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: 'rgba(255,255,255,0.62)', borderRadius: 16, padding: '18px 16px', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div style={{ fontSize: 30, marginBottom: 4 }}>🌳</div>
                  <div style={{ fontSize: 26, color: '#166534', fontWeight: 600 }}>{fmt(carbon.comparison.equivalentTreesNeeded)}</div>
                  <div style={{ fontSize: 11, color: '#4d7c0f', fontFamily: 'Arial, sans-serif', marginTop: 4, lineHeight: 1.4 }}>
                    trees absorbing CO₂ for a full year to offset this
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.62)', borderRadius: 16, padding: '18px 16px', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div style={{ fontSize: 30, marginBottom: 4 }}>🚗</div>
                  <div style={{ fontSize: 26, color: '#166534', fontWeight: 600 }}>{fmt(carbon.comparison.equivalentCarMiles)}</div>
                  <div style={{ fontSize: 11, color: '#4d7c0f', fontFamily: 'Arial, sans-serif', marginTop: 4, lineHeight: 1.4 }}>
                    equivalent car miles at avg US emissions
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20, padding: '13px 16px', background: 'rgba(255,255,255,0.5)', borderRadius: 14, border: '1px solid rgba(34,197,94,0.12)' }}>
                <span style={{ fontSize: 13, color: '#166534', fontFamily: 'Arial, sans-serif' }}>
                  Overall intensity: <strong>{avgCarbonPerKm} kg CO₂/km</strong> across all {fmt(Math.round(overview.totalDistanceKm))} km
                </span>
              </div>
            </div>

            {/* Right: by mode */}
            <div style={{ ...cardBase, padding: '32px 36px' }}>
              <SectionTitle>Carbon by Mode</SectionTitle>
              {carbon.byTransport.map(t => {
                const meta = tm(t.mode);
                return (
                  <div key={t.mode} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: '#5b3926', fontFamily: 'Arial, sans-serif' }}>
                        {meta.emoji} {meta.label}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, color: '#5b3926', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>{fmt(t.carbonKg)} kg</span>
                        <span style={{ fontSize: 12, color: '#9b7a4d', fontFamily: 'Arial, sans-serif', marginLeft: 8 }}>{t.percentOfTotal}%</span>
                      </div>
                    </div>
                    <div style={{ height: 9, background: 'rgba(180,150,100,0.12)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${t.percentOfTotal}%`, background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})`, borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })}
              {ecoModes.length > 0 && (
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(34,197,94,0.06)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.15)' }}>
                  <span style={{ fontSize: 12, color: '#166534', fontFamily: 'Arial, sans-serif' }}>
                    🌿 Switch more trips to <strong>{tm(ecoModes[0].mode).label}</strong> to cut your footprint
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ REPEATED ROUTES ══════════════════════════════ */}
        {repeatedRoutes.length > 0 && (
          <div style={{ ...cardBase, padding: '32px 36px', marginBottom: 24 }}>
            <SectionTitle>Your Signature Routes</SectionTitle>
            <p style={{ margin: '-18px 0 24px 0', fontSize: 14, color: '#8b6a46', fontFamily: 'Arial, sans-serif' }}>
              Routes you've traveled more than once — your personal corridors
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
              {repeatedRoutes.map((r, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(190,175,145,0.22)',
                  borderRadius: 18,
                  padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#5b3926' }}>{r.origin}</span>
                    <span style={{ color: '#b5792a', fontSize: 16 }}>→</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#5b3926' }}>{r.destination}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {r.transportModes.map(m => (
                      <span key={m} style={{
                        fontSize: 11, background: 'rgba(181,121,42,0.1)', color: '#7a5738',
                        borderRadius: 999, padding: '2px 10px', fontFamily: 'Arial, sans-serif',
                        border: '1px solid rgba(181,121,42,0.18)',
                      }}>
                        {tm(m).emoji} {tm(m).label}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9b7a4d', fontFamily: 'Arial, sans-serif' }}>
                    <span>🔁 {r.timesTraveled}× traveled</span>
                    <span>{fmt(r.totalDistanceKm)} km total</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#b5a090', fontFamily: 'Arial, sans-serif', marginTop: 5 }}>
                    avg {fmt(r.avgCarbonPerTrip)} kg CO₂ per journey
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ FUN FACTS GRID ═══════════════════════════════ */}
        <div style={{ ...cardBase, padding: '32px 36px', marginBottom: 32 }}>
          <SectionTitle>By The Numbers</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {funFacts.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.62)',
                border: '1px solid rgba(190,175,145,0.2)',
                borderRadius: 18,
                padding: '20px 18px',
              }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 26, color: '#5b3926', lineHeight: 1, marginBottom: 5, fontWeight: 600 }}>{f.stat}</div>
                <div style={{ fontSize: 13, color: '#5b3926', fontFamily: 'Arial, sans-serif', marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: 11, color: '#b5a090', fontFamily: 'Arial, sans-serif', lineHeight: 1.4 }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ FOOTER CTA ═══════════════════════════════════ */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#9b7a4d', fontFamily: 'Arial, sans-serif', fontSize: 15, marginBottom: 18 }}>
            Your story isn't finished yet — keep exploring.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/trips" style={{
              background: 'linear-gradient(180deg, #b5792a 0%, #8d5a1f 100%)',
              color: '#f7f2e8', textDecoration: 'none', borderRadius: 14, padding: '13px 30px', fontSize: 15,
              boxShadow: '0 6px 16px rgba(80,50,20,0.14)',
            }}>
              Log a New Trip
            </Link>
            <Link href="/map-user" style={{
              background: 'rgba(255,255,255,0.78)', color: '#6b4b2f', textDecoration: 'none',
              borderRadius: 14, padding: '13px 30px', fontSize: 15,
              border: '1px solid rgba(180,150,100,0.25)',
            }}>
              View Your Map
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
