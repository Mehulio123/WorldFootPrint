import type { Trip, Segment } from '@/lib/api/trips';

// Modes that should always use a curved arc (air or water — no roads)
const ARC_MODES = ['flight', 'ferry'];

// Modes that use road routing via Mapbox Directions API
const ROAD_PROFILE: Record<string, 'driving' | 'cycling' | 'walking'> = {
  car: 'driving',
  bus: 'driving',
  train: 'driving', // trains follow tracks, not roads, but driving is the closest fallback
  bike: 'cycling',
  walk: 'walking',
};

// Max distance (km) to attempt road routing — beyond this roads don't make sense
// (e.g. London → Beijing by train is ~8000km, Mapbox can't route that)
const MAX_ROAD_ROUTING_KM = 2000;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

// Haversine distance between two [lng, lat] points in km
function haversineKm(from: [number, number], to: [number, number]): number {
  const R = 6371;
  const dLat = toRad(to[1] - from[1]);
  const dLng = toRad(to[0] - from[0]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from[1])) * Math.cos(toRad(to[1])) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Great-circle arc — returns evenly spaced intermediate points along the Earth's surface.
// Works in 3D (SLERP), so it handles the antimeridian correctly.
function getArcCoordinates(
  from: [number, number], // [lng, lat]
  to: [number, number],
  steps = 60
): [number, number][] {
  const lat1 = toRad(from[1]);
  const lng1 = toRad(from[0]);
  const lat2 = toRad(to[1]);
  const lng2 = toRad(to[0]);

  // Angular distance between the two points on the sphere
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
      )
    );

  // Points are essentially the same — return straight line
  if (d < 0.0001) return [from, to];

  const coords: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lng = toDeg(Math.atan2(y, x));

    coords.push([lng, lat]);
  }

  return coords;
}

// Calls Mapbox Directions API and returns road geometry, or null if it fails.
// Null triggers a fallback to arc in the caller.
async function getRoadCoordinates(
  from: [number, number],
  to: [number, number],
  profile: 'driving' | 'cycling' | 'walking',
  token: string
): Promise<[number, number][] | null> {
  // Sanity check 1: distance too large for road routing
  const distKm = haversineKm(from, to);
  if (distKm > MAX_ROAD_ROUTING_KM) return null;

  // Sanity check 2: same point
  if (from[0] === to[0] && from[1] === to[1]) return null;

  try {
    const url =
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/` +
      `${from[0]},${from[1]};${to[0]},${to[1]}` +
      `?geometries=geojson&overview=full&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();

    // Sanity check 3: API returned no routes (e.g. ocean between two points)
    if (!data.routes || data.routes.length === 0) return null;

    return data.routes[0].geometry.coordinates as [number, number][];
  } catch {
    // Network failure, rate limit, etc. — fall back gracefully
    return null;
  }
}

// Resolves the best coordinates for a single segment based on its transport mode.
export async function resolveSegmentCoordinates(
  segment: Segment,
  token: string
): Promise<[number, number][]> {
  const from: [number, number] = [segment.origin.longitude, segment.origin.latitude];
  const to: [number, number] = [segment.destination.longitude, segment.destination.latitude];
  const mode = segment.transportMode.toLowerCase();

  // Flight / ferry → always arc
  if (ARC_MODES.includes(mode)) {
    return getArcCoordinates(from, to);
  }

  // Ground transport → try road routing, fall back to arc if it fails
  const profile = ROAD_PROFILE[mode];
  if (profile) {
    const roadCoords = await getRoadCoordinates(from, to, profile, token);
    if (roadCoords) return roadCoords;
  }

  // Unknown mode or road routing failed → arc as safe fallback
  return getArcCoordinates(from, to);
}

// Enriches all trips with resolvedCoordinates on each segment.
// All Directions API calls are fired in parallel for speed.
export async function resolveTripsRoutes(trips: Trip[], token: string): Promise<Trip[]> {
  return Promise.all(
    trips.map(async (trip) => ({
      ...trip,
      segments: await Promise.all(
        trip.segments.map(async (seg) => ({
          ...seg,
          resolvedCoordinates: await resolveSegmentCoordinates(seg, token),
        }))
      ),
    }))
  );
}
