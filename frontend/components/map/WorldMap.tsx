'use client';

import { useRef, useState } from 'react';
import MapGL, { Marker, Layer, Source } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Trip } from '@/lib/api/trips';

type ViewMode = 'globe' | 'heat' | 'atlas';

const MODES: { id: ViewMode; icon: string; label: string }[] = [
  { id: 'globe', icon: '🌍', label: 'Globe' },
  { id: 'heat',  icon: '🌡️', label: 'Heat'  },
  { id: 'atlas', icon: '🗺️', label: '2D'    },
];

function styleUrl(m: ViewMode) {
  if (m === 'atlas')     return 'mapbox://styles/mapbox/light-v11';
  return 'mapbox://styles/mapbox/dark-v11';
}
// Sources are keyed per style so they remount cleanly after a base-style swap
function styleKey(m: ViewMode) {
  if (m === 'atlas') return 'light';
  return 'dark';
}

type HeatPreset = 'demo' | 'personal';

const HEAT_PRESETS: Record<HeatPreset, { intensity: number[]; radius: number[]; opacity: number }> = {
  demo:     { intensity: [0, 0.5, 5, 0.9, 9, 1.5],  radius: [0, 14, 3, 26, 6, 50, 9, 80],  opacity: 0.45 },
  personal: { intensity: [0, 1.5, 5, 2.2, 9, 3.5],  radius: [0, 22, 3, 38, 6, 70, 9, 110], opacity: 0.65 },
};

export function WorldMap({ trips, heatPreset = 'personal' }: { trips: Trip[]; heatPreset?: HeatPreset }) {
  const mapRef  = useRef<MapRef>(null);
  const [zoom, setZoom] = useState(1.5);
  const [mode, setMode] = useState<ViewMode>('globe');
  const modeRef = useRef<ViewMode>('globe');
  modeRef.current = mode;

  /* ─── Projection / fog / text applied on load and after every style swap ─ */
  function applyConfig(map: any, m: ViewMode) {
    map.setProjection(m === 'atlas' ? 'mercator' : 'globe');

    if (m === 'globe') {
      map.setFog({
        color: 'rgb(80, 100, 150)',
        'high-color': 'rgb(30, 45, 100)',
        'horizon-blend': 0.12,
        'space-color': 'rgb(10, 12, 30)',
        'star-intensity': 0.55,
      });
    } else {
      map.setFog(null);
    }

    // Override symbol layer text colours in dark-based styles
    if (m !== 'atlas') {
      try {
        map.getStyle()?.layers?.forEach((layer: any) => {
          if (layer.type === 'symbol') {
            map.setPaintProperty(layer.id, 'text-color', '#d4d4d4');
            map.setPaintProperty(layer.id, 'text-halo-color', '#000000');
            map.setPaintProperty(layer.id, 'text-halo-width', 1.5);
          }
        });
      } catch (_) {}
    }
  }

  function handleMapLoad(e: { target: any }) {
    const map = e.target;
    applyConfig(map, modeRef.current);
    map.on('style.load', () => applyConfig(map, modeRef.current));
  }

  function changeMode(next: ViewMode) {
    const prev = modeRef.current;
    setMode(next);
    // Same base style → re-apply config immediately (no style.load will fire)
    if (styleKey(next) === styleKey(prev)) {
      const map = mapRef.current?.getMap();
      if (map?.isStyleLoaded()) applyConfig(map, next);
    }
    // Different base style → style.load listener handles it
  }

  /* ─── Route GeoJSON ───────────────────────────────────────────────────── */
  const routeData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: trips.flatMap(trip =>
      trip.segments.map(seg => ({
        type: 'Feature' as const,
        properties: { tmode: seg.transportMode.toLowerCase() },
        geometry: {
          type: 'LineString' as const,
          coordinates: seg.resolvedCoordinates ?? [
            [seg.origin.longitude,      seg.origin.latitude],
            [seg.destination.longitude, seg.destination.latitude],
          ],
        },
      }))
    ),
  };

  const airFilter:    any = ['in', ['get', 'tmode'], ['literal', ['flight', 'ferry']]];
  const groundFilter: any = ['!',  ['in', ['get', 'tmode'], ['literal', ['flight', 'ferry']]]];

  /* ─── Heat data: sparse route coords (very low weight) + cities (high) ── */
  const heatFeatures: GeoJSON.Feature[] = [];
  trips.forEach(trip => trip.segments.forEach(seg => {
    if (seg.transportMode.toLowerCase() === 'flight') return;
    const coords = seg.resolvedCoordinates ?? [];
    // Sample every 8th intermediate coord so routes appear as a faint trace, not a line
    const inner = coords.slice(1, -1);
    inner.filter((_, i) => i % 8 === 0).forEach(coord => heatFeatures.push({
      type: 'Feature' as const,
      properties: { weight: 0.04 },
      geometry: { type: 'Point' as const, coordinates: coord },
    }));
  }));
  // Cities: weight driven by visit count — includes flight endpoints but not flight paths
  const heatCityVisits = new Map<string, { coord: number[]; visits: number }>();
  trips.forEach(trip => trip.segments.forEach(seg => {
    for (const city of [seg.origin, seg.destination]) {
      const prev = heatCityVisits.get(city.name);
      heatCityVisits.set(city.name, {
        coord: [city.longitude, city.latitude],
        visits: (prev?.visits ?? 0) + 1,
      });
    }
  }));
  const maxVisits = Math.max(1, ...Array.from(heatCityVisits.values()).map(v => v.visits));
  heatCityVisits.forEach(({ coord, visits }) => heatFeatures.push({
    type: 'Feature' as const,
    properties: { weight: 0.3 + 0.7 * (visits / maxVisits) },
    geometry: { type: 'Point' as const, coordinates: coord },
  }));
  const heatData: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: heatFeatures };

  /* ─── City data ───────────────────────────────────────────────────────── */
  const cityMap    = new Map<string, { name: string; latitude: number; longitude: number }>();
  const cityVisits = new Map<string, number>();
  trips.forEach(trip => trip.segments.forEach(seg => {
    cityMap.set(seg.origin.name,      seg.origin);
    cityMap.set(seg.destination.name, seg.destination);
    cityVisits.set(seg.origin.name,      (cityVisits.get(seg.origin.name)      ?? 0) + 1);
    cityVisits.set(seg.destination.name, (cityVisits.get(seg.destination.name) ?? 0) + 1);
  }));
  const allCities = Array.from(cityMap.values())
    .sort((a, b) => (cityVisits.get(b.name) ?? 0) - (cityVisits.get(a.name) ?? 0));

  const cityGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: allCities.map(city => ({
      type: 'Feature' as const,
      properties: { visits: cityVisits.get(city.name) ?? 1 },
      geometry: { type: 'Point' as const, coordinates: [city.longitude, city.latitude] },
    })),
  };

  /* ─── Label culling ───────────────────────────────────────────────────── */
  function getVisibleLabels() {
    const thresh = 20 / Math.pow(2, zoom - 3);
    if (thresh < 0.4) return allCities;
    const shown: typeof allCities = [];
    for (const city of allCities) {
      const tooClose = shown.some(s =>
        Math.sqrt(Math.pow(city.latitude - s.latitude, 2) + Math.pow(city.longitude - s.longitude, 2)) < thresh
      );
      if (!tooClose) shown.push(city);
    }
    return shown;
  }
  const visibleLabels = zoom >= 3 ? getVisibleLabels() : [];

  /* ─── Country match expression ────────────────────────────────────────── */
  const countryVisits = new Map<string, number>();
  trips.forEach(trip => trip.segments.forEach(seg => {
    countryVisits.set(seg.origin.countryCode,      (countryVisits.get(seg.origin.countryCode)      ?? 0) + 1);
    countryVisits.set(seg.destination.countryCode, (countryVisits.get(seg.destination.countryCode) ?? 0) + 1);
  }));
  const cMatch: unknown[] = ['match', ['get', 'iso_3166_1']];
  countryVisits.forEach((n, code) => cMatch.push(code, n));
  cMatch.push(0);

  /* ─── Per-mode derived paint values ──────────────────────────────────── */
  const sk = styleKey(mode);

  // Country fill — 0 opacity in heat mode
  const countryColor: any =
    mode === 'atlas' ? ['interpolate', ['linear'], cMatch, 0, '#c8b48a', 1, '#b5792a', 4, '#d4ac68', 10, '#f0c060'] :
                       ['interpolate', ['linear'], cMatch, 0, '#4a4a5a', 1, '#1a5c35', 4, '#27ae60', 10, '#2ecc71'];
  const countryOpacity: any =
    mode === 'heat' ? 0 :
    mode === 'atlas' ? (['case', ['>', cMatch, 0], 0.38, 0.06] as any) :
                       (['case', ['>', cMatch, 0], 0.22, 0.58] as any);

  // Route line colours
  const airColor    = mode === 'atlas' ? '#c9893a' : '#F0A030';
  const groundColor = mode === 'atlas' ? '#3a7a5a' : '#2ECC71';

  // Route opacity — 0 in heat mode
  const routeOpacity = mode === 'heat' ? 0 : mode === 'atlas' ? 0.85 : 0.95;

  // Route width
  const lineW: any = ['interpolate', ['linear'], ['zoom'], 1, 2, 5, 3.5, 10, 5];

  // City dots
  const dotOpacity = mode === 'heat' ? 0 : 1;
  const dotColor   = mode === 'atlas' ? '#b5792a' : '#F0A030';
  const dotStroke  = mode === 'atlas' ? '#5b3926' : '#ffffff';

  // Labels
  const showLabels = mode === 'globe' || mode === 'atlas';
  const labelBg     = mode === 'atlas' ? 'rgba(255,248,235,0.92)' : 'rgba(15,12,30,0.82)';
  const labelBorder = mode === 'atlas' ? '1px solid rgba(181,121,42,0.4)' : '1px solid rgba(240,160,48,0.4)';
  const labelColor  = mode === 'atlas' ? '#5b3926' : '#f5deb3';

  // Toggle pill
  const lightUI    = mode === 'atlas';
  const toggleBg   = lightUI ? 'rgba(255,250,240,0.93)'          : 'rgba(15,12,30,0.82)';
  const toggleBord = lightUI ? '1px solid rgba(181,121,42,0.28)' : '1px solid rgba(240,160,48,0.28)';

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg" style={{ position: 'relative' }}>

      {/* ── Mode toggle pill ──────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, display: 'flex', gap: 3,
        background: toggleBg, border: toggleBord, borderRadius: 999,
        padding: '4px 5px', backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      }}>
        {MODES.map(m => {
          const active = mode === m.id;
          return (
            <button key={m.id} onClick={() => changeMode(m.id)} style={{
              background: active ? (lightUI ? 'rgba(181,121,42,0.16)' : 'rgba(240,160,48,0.22)') : 'transparent',
              border:     active ? (lightUI ? '1px solid rgba(181,121,42,0.5)' : '1px solid rgba(240,160,48,0.55)') : '1px solid transparent',
              borderRadius: 999, padding: '5px 14px',
              color: active ? (lightUI ? '#7a4f1a' : '#F0A030') : (lightUI ? 'rgba(80,50,20,0.42)' : 'rgba(255,255,255,0.4)'),
              fontSize: 12, fontFamily: 'Arial, sans-serif',
              cursor: 'pointer', transition: 'all 0.14s ease',
              display: 'flex', alignItems: 'center', gap: 5,
              whiteSpace: 'nowrap', letterSpacing: '0.3px',
            }}>
              <span style={{ fontSize: 13 }}>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Map ──────────────────────────────────────────────────────────── */}
      <MapGL
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={styleUrl(mode)}
        cursor="default"
        onLoad={handleMapLoad}
        onMove={e => setZoom(e.viewState.zoom)}
      >

        {/* ── Country shading ─────────────────────────────────────────────── */}
        <Source key={`country-${sk}`} id="country-boundaries" type="vector" url="mapbox://mapbox.country-boundaries-v1">
          <Layer
            id="country-visit-fill"
            type="fill"
            source-layer="country_boundaries"
            paint={{ 'fill-color': countryColor, 'fill-opacity': countryOpacity }}
          />
        </Source>

        {/* ── Route lines ─────────────────────────────────────────────────── */}
        <Source key={`routes-${sk}`} id="routes" type="geojson" data={routeData}>

          {/* Globe glow — always mounted, opacity driven by mode */}
          <Layer id="glow-air" type="line" filter={airFilter}
            paint={{ 'line-color': '#FFB347', 'line-width': ['interpolate', ['linear'], ['zoom'], 1, 10, 5, 16, 10, 24], 'line-opacity': mode === 'globe' ? 0.25 : 0, 'line-blur': 8 }} />
          <Layer id="glow-ground" type="line" filter={groundFilter}
            paint={{ 'line-color': '#3DD68C', 'line-width': ['interpolate', ['linear'], ['zoom'], 1, 10, 5, 16, 10, 24], 'line-opacity': mode === 'globe' ? 0.25 : 0, 'line-blur': 8 }} />

          {/* Air routes — dashed */}
          <Layer id="route-air-dashed" type="line" filter={airFilter}
            paint={{ 'line-color': airColor, 'line-width': lineW, 'line-opacity': routeOpacity, 'line-dasharray': [4, 3] }} />

          {/* Ground routes — always solid */}
          <Layer id="route-ground" type="line" filter={groundFilter}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': groundColor, 'line-width': lineW, 'line-opacity': routeOpacity }} />

        </Source>

        {/* ── City dots ───────────────────────────────────────────────────── */}
        <Source key={`city-${sk}`} id="city-data" type="geojson" data={cityGeoJSON}>

          <Layer id="city-dots" type="circle"
            paint={{
              'circle-radius': 4,
              'circle-color': dotColor,
              'circle-opacity': dotOpacity,
              'circle-stroke-width': 2,
              'circle-stroke-color': dotStroke,
              'circle-stroke-opacity': dotOpacity,
            }} />
        </Source>

        {/* ── Heatmap (non-flight route coordinates) ──────────────────────── */}
        {mode === 'heat' && (
          <Source id="heat-data" type="geojson" data={heatData}>
            <Layer id="travel-heat" type="heatmap"
              paint={{
                'heatmap-weight':    ['coalesce', ['get', 'weight'], 0.04],
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'],
                  0, HEAT_PRESETS[heatPreset].intensity[1],
                  5, HEAT_PRESETS[heatPreset].intensity[3],
                  9, HEAT_PRESETS[heatPreset].intensity[5],
                ],
                'heatmap-color': [
                  'interpolate', ['linear'], ['heatmap-density'],
                  0,    'rgba(0,0,0,0)',
                  0.15, 'rgba(0,0,0,0)',
                  0.30, 'rgba(0,100,180,0.30)',
                  0.50, 'rgba(0,200,120,0.55)',
                  0.68, 'rgba(240,200,0,0.70)',
                  0.85, 'rgba(255,100,0,0.82)',
                  1.0,  'rgba(255,255,200,0.92)',
                ],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'],
                  0, HEAT_PRESETS[heatPreset].radius[1],
                  3, HEAT_PRESETS[heatPreset].radius[3],
                  6, HEAT_PRESETS[heatPreset].radius[5],
                  9, HEAT_PRESETS[heatPreset].radius[7],
                ],
                'heatmap-opacity': HEAT_PRESETS[heatPreset].opacity,
              }}
            />
          </Source>
        )}

        {/* ── City labels ─────────────────────────────────────────────────── */}
        {showLabels && visibleLabels.map(city => (
          <Marker key={city.name} longitude={city.longitude} latitude={city.latitude} anchor="top">
            <div style={{
              marginTop: 6, background: labelBg, border: labelBorder,
              borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 600,
              color: labelColor, whiteSpace: 'nowrap',
              boxShadow: '0 1px 6px rgba(0,0,0,0.5)',
              opacity: Math.min(1, (zoom - 3) / 1.5), pointerEvents: 'none',
            }}>
              {city.name}
            </div>
          </Marker>
        ))}

      </MapGL>
    </div>
  );
}
