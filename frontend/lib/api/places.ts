import apiClient from './client';

export interface PlaceResult {
  id: string;
  name: string;
  countryName: string;
  countryCode: string;
  displayName?: string;
  latitude: number;
  longitude: number;
}

// Shape of a Mapbox Geocoding API feature
interface MapboxFeature {
  text: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  context?: Array<{ id: string; text: string; short_code?: string }>;
}

// Search the entire world via Mapbox Geocoding API.
// Returns a lightweight list for display — no backend involved yet.
export async function searchPlacesGlobal(query: string): Promise<MapboxFeature[]> {
  if (query.trim().length < 2) return [];

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${token}&types=place,locality,region&limit=8&language=en`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.features ?? [];
  } catch {
    return [];
  }
}

// Extract a clean PlaceResult shape from a Mapbox feature (without an ID yet).
export function mapboxFeatureToPlace(feature: MapboxFeature): Omit<PlaceResult, 'id'> {
  const countryCtx = feature.context?.find(c => c.id.startsWith('country.'));
  const countryCode = (countryCtx?.short_code ?? 'XX').toUpperCase();
  const countryName = countryCtx?.text ?? 'Unknown';

  return {
    name: feature.text,
    displayName: feature.place_name,
    countryCode,
    countryName,
    longitude: feature.center[0],
    latitude: feature.center[1],
  };
}

export const placesApi = {
  // Register a Mapbox-sourced place in the backend (find or create).
  // Returns the persisted Place with its database ID.
  findOrCreate: async (data: Omit<PlaceResult, 'id'>): Promise<PlaceResult> => {
    const response = await apiClient.post('/places/findOrCreate', data);
    return response.data;
  },
};
