'use client';

import { useRef, useState } from 'react';
import MapGL, { Marker, Layer, Source } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Trip } from '@/lib/api/trips';

interface WorldMapProps {
  trips: Trip[];
}

export function WorldMap({ trips }: WorldMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [zoom, setZoom] = useState(1.5);

  // On load: switch to globe projection and add atmospheric fog + stars
  function handleMapLoad(e: { target: any }) {
    const map = e.target;
    map.setProjection('globe');

    // Override text on every symbol layer in the style
    map.getStyle().layers.forEach((layer: any) => {
      if (layer.type === 'symbol') {
        map.setPaintProperty(layer.id, 'text-color', '#d4d4d4');
        map.setPaintProperty(layer.id, 'text-halo-color', '#000000');
        map.setPaintProperty(layer.id, 'text-halo-width', 1.5);
      }
    });

    map.setFog({
      color: 'rgb(80, 100, 150)',          // soft blue-grey at the horizon
      'high-color': 'rgb(30, 45, 100)',    // deeper blue upper atmosphere
      'horizon-blend': 0.12,              // wide, gradual atmospheric glow
      'space-color': 'rgb(10, 12, 30)',    // dark blue-black space
      'star-intensity': 0.55,             // subtle stars
    });
  }

  // Build GeoJSON lines from all segments across all trips.
  // Uses resolvedCoordinates (arc or road geometry) when available,
  // otherwise falls back to a straight 2-point line.
  const routeData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: trips.flatMap((trip) =>
      trip.segments.map((seg) => ({
        type: 'Feature' as const,
        properties: { tripTitle: trip.title, mode: seg.transportMode.toLowerCase() },
        geometry: {
          type: 'LineString' as const,
          coordinates: seg.resolvedCoordinates ?? [
            [seg.origin.longitude, seg.origin.latitude],
            [seg.destination.longitude, seg.destination.latitude],
          ],
        },
      }))
    ),
  };

  // Deduplicate cities, counting appearances to rank importance
  const cityMap = new Map<string, { name: string; latitude: number; longitude: number }>();
  const cityVisits = new Map<string, number>();
  trips.forEach((trip) => {
    trip.segments.forEach((seg) => {
      cityMap.set(seg.origin.name, seg.origin);
      cityMap.set(seg.destination.name, seg.destination);
      cityVisits.set(seg.origin.name, (cityVisits.get(seg.origin.name) ?? 0) + 1);
      cityVisits.set(seg.destination.name, (cityVisits.get(seg.destination.name) ?? 0) + 1);
    });
  });

  const allCities = Array.from(cityMap.values())
    .sort((a, b) => (cityVisits.get(b.name) ?? 0) - (cityVisits.get(a.name) ?? 0));

  // Greedy spacing filter — at low zoom, suppress labels that are too close together.
  // Threshold in degrees shrinks as zoom increases, revealing denser labels.
  // Below 0.4° threshold (zoom ~8+) everything is shown.
  function getVisibleLabels() {
    const thresholdDeg = 20 / Math.pow(2, zoom - 3);
    if (thresholdDeg < 0.4) return allCities;

    const shown: typeof allCities = [];
    for (const city of allCities) {
      const tooClose = shown.some((s) => {
        const dLat = city.latitude - s.latitude;
        const dLng = city.longitude - s.longitude;
        return Math.sqrt(dLat * dLat + dLng * dLng) < thresholdDeg;
      });
      if (!tooClose) shown.push(city);
    }
    return shown;
  }

  const visibleLabels = zoom >= 3 ? getVisibleLabels() : [];

  // Count how many segments touched each country (origin + destination)
  const countryVisits = new Map<string, number>();
  trips.forEach((trip) => {
    trip.segments.forEach((seg) => {
      countryVisits.set(seg.origin.countryCode, (countryVisits.get(seg.origin.countryCode) ?? 0) + 1);
      countryVisits.set(seg.destination.countryCode, (countryVisits.get(seg.destination.countryCode) ?? 0) + 1);
    });
  });

  // Build a Mapbox match expression: iso_3166_1 → visit count (0 for unvisited)
  // Then wrap in interpolate to map count → fill color
  const countryVisitMatch: unknown[] = ['match', ['get', 'iso_3166_1']];
  countryVisits.forEach((count, code) => {
    countryVisitMatch.push(code, count);
  });
  countryVisitMatch.push(0); // default: unvisited = 0

  const countryFillColor = [
    'interpolate', ['linear'], countryVisitMatch,
    0,  '#4a4a5a',   // unvisited — blue-grey
    1,  '#1a5c35',   // visited once — dark green
    4,  '#27ae60',   // visited a few times — medium green
    10, '#2ecc71',   // heavily visited — bright green
  ];

  const countryFillOpacity = [
    'case', ['>', countryVisitMatch, 0],
    0.22,  // visited: light green tint, map shows through clearly
    0.58,  // unvisited: heavier grey overlay
  ];

  // All cities still get dots regardless of label visibility
  const cityData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: allCities.map((city) => ({
      type: 'Feature' as const,
      properties: { name: city.name },
      geometry: {
        type: 'Point' as const,
        coordinates: [city.longitude, city.latitude],
      },
    })),
  };

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
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={handleMapLoad}
        onMove={(e) => setZoom(e.viewState.zoom)}
      >
        {/* Country shading — grey for unvisited, green gradient based on visit count */}
        <Source id="country-boundaries" type="vector" url="mapbox://mapbox.country-boundaries-v1">
          <Layer
            id="country-visit-fill"
            type="fill"
            source-layer="country_boundaries"
            paint={{
              'fill-color': countryFillColor as any,
              'fill-opacity': countryFillOpacity as any,
            }}
          />
        </Source>

        {/* Route lines — flights/ferries are dashed arcs, ground transport is solid */}
        <Source id="routes" type="geojson" data={routeData}>

          {/* ── Air/Ferry glow — bright amber halo, pops on dark background */}
          <Layer
            id="route-layer-air-glow"
            type="line"
            filter={['in', ['get', 'mode'], ['literal', ['flight', 'ferry']]]}
            paint={{
              'line-color': '#FFB347',
              'line-width': ['interpolate', ['linear'], ['zoom'], 1, 10, 5, 16, 10, 24],
              'line-opacity': 0.25,
              'line-blur': 8,
            }}
          />
          {/* ── Air/Ferry main line: dashed arc in warm gold */}
          <Layer
            id="route-layer-air"
            type="line"
            filter={['in', ['get', 'mode'], ['literal', ['flight', 'ferry']]]}
            paint={{
              'line-color': '#F0A030',
              'line-width': ['interpolate', ['linear'], ['zoom'], 1, 2, 5, 3.5, 10, 5],
              'line-opacity': 0.95,
              'line-dasharray': [4, 3],
            }}
          />

          {/* ── Ground glow — teal/green halo */}
          <Layer
            id="route-layer-ground-glow"
            type="line"
            filter={['!', ['in', ['get', 'mode'], ['literal', ['flight', 'ferry']]]]}
            paint={{
              'line-color': '#3DD68C',
              'line-width': ['interpolate', ['linear'], ['zoom'], 1, 10, 5, 16, 10, 24],
              'line-opacity': 0.25,
              'line-blur': 8,
            }}
          />
          {/* ── Ground main line: solid teal with round caps */}
          <Layer
            id="route-layer-ground"
            type="line"
            filter={['!', ['in', ['get', 'mode'], ['literal', ['flight', 'ferry']]]]}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{
              'line-color': '#2ECC71',
              'line-width': ['interpolate', ['linear'], ['zoom'], 1, 2, 5, 3.5, 10, 5],
              'line-opacity': 0.95,
            }}
          />

        </Source>

        {/* City dots — bright white/amber to stand out on dark map */}
        <Source id="cities" type="geojson" data={cityData}>
          <Layer
            id="city-dots"
            type="circle"
            paint={{
              'circle-radius': 4,
              'circle-color': '#F0A030',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>

        {/* City labels — dark background pill, fade in on zoom */}
        {visibleLabels.map((city) => (
          <Marker
            key={city.name}
            longitude={city.longitude}
            latitude={city.latitude}
            anchor="top"
          >
            <div style={{
              marginTop: '6px',
              background: 'rgba(15, 12, 30, 0.82)',
              border: '1px solid rgba(240, 160, 48, 0.4)',
              borderRadius: '4px',
              padding: '2px 7px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#f5deb3',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 6px rgba(0,0,0,0.5)',
              opacity: Math.min(1, (zoom - 3) / 1.5),
              pointerEvents: 'none',
            }}>
              {city.name}
            </div>
          </Marker>
        ))}
      </MapGL>
    </div>
  );
}
