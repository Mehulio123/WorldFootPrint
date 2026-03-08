/**
 * Utility functions for distance and carbon calculations
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * The Haversine formula calculates the great-circle distance between two points
 * on a sphere given their longitudes and latitudes
 * 
 * @param lat1 - Latitude of point 1 (in degrees)
 * @param lon1 - Longitude of point 1 (in degrees)
 * @param lat2 - Latitude of point 2 (in degrees)
 * @param lon2 - Longitude of point 2 (in degrees)
 * @returns Distance in kilometers (rounded to nearest km)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Earth's radius in kilometers
  const R = 6371;

  // Convert latitude and longitude differences to radians
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  // Haversine formula
  // a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  // c = 2 ⋅ atan2(√a, √(1−a))
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance = R × c
  const distance = R * c;

  // Return rounded distance
  return Math.round(distance);
}

/**
 * Helper function to convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate carbon footprint based on distance and transport mode
 * Uses average emissions per kilometer per passenger
 * 
 * @param distanceKm - Distance traveled in kilometers
 * @param transportMode - Type of transport (flight, train, car, etc.)
 * @returns Carbon footprint in kg CO2 (rounded to 1 decimal place)
 */
export function calculateCarbon(
  distanceKm: number,
  transportMode: string
): number {
  // Average carbon emissions per km per passenger (in kg CO2)
  // Source: UK Government GHG Conversion Factors
  const emissionsPerKm: Record<string, number> = {
    flight: 0.255,      // Domestic flight average
    car: 0.192,         // Average car (medium size)
    bus: 0.089,         // Coach/long-distance bus
    train: 0.041,       // National rail (electric)
    ferry: 0.115,       // Ferry (foot passenger)
    walk: 0,            // Zero emissions
    bike: 0,            // Zero emissions
  };

  // Get emission rate for this transport mode (default to car if unknown)
  const rate = emissionsPerKm[transportMode.toLowerCase()] || 0.192;

  // Calculate total carbon and round to 1 decimal place
  return Math.round(distanceKm * rate * 10) / 10;
}

/**
 * Example usage:
 * 
 * const distance = calculateDistance(40.7128, -74.0060, 51.5074, -0.1278);
 * // NYC to London = ~5571 km
 * 
 * const carbon = calculateCarbon(distance, 'flight');
 * // ~1420.6 kg CO2
 */