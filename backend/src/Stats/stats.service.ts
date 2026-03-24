// Injectable decorator - allows this service to be injected into controllers
import { Injectable } from '@nestjs/common';

// Import PrismaService to query the database
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  // Inject PrismaService so we can use this.prisma to query database
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. OVERVIEW STATS
  // ==========================================
  // Returns high-level summary: total trips, distance, countries, etc.
  async getOverview(userId: string) {
    // Count total trips for this user
    const totalTrips = await this.prisma.trip.count({
      where: { userId },
    });

    // Count total segments across all trips for this user
    const totalSegments = await this.prisma.segment.count({
      where: {
        trip: { userId },  // Filter segments by user's trips
      },
    });

    // Aggregate (sum) total distance and carbon
    // _sum returns an object with the summed fields
    const distanceAndCarbon = await this.prisma.segment.aggregate({
      where: {
        trip: { userId },
      },
      _sum: {
        distance: true,        // Sum all distances
        carbonFootprint: true, // Sum all carbon
      },
    });

    // Find all unique places this user has been to (as origin or destination)
    // First, get all segments for this user
    const userSegments = await this.prisma.segment.findMany({
      where: {
        trip: { userId },
      },
      // Include both origin and destination places
      include: {
        origin: true,
        destination: true,
      },
    });

    // Extract unique country codes
    // Create a Set (automatically removes duplicates)
    const countryCodesSet = new Set<string>();
    userSegments.forEach((segment) => {
      countryCodesSet.add(segment.origin.countryCode);
      countryCodesSet.add(segment.destination.countryCode);
    });

    // Extract unique city names
    const cityNamesSet = new Set<string>();
    userSegments.forEach((segment) => {
      cityNamesSet.add(segment.origin.name);
      cityNamesSet.add(segment.destination.name);
    });

    // Group segments by transport mode to find most used
    // groupBy returns array of { transportMode: "flight", _count: { id: 5 } }
    const transportGroups = await this.prisma.segment.groupBy({
      by: ['transportMode'],  // Group by this field
      where: {
        trip: { userId },
      },
      _count: {
        id: true,  // Count how many segments per transport mode
      },
      orderBy: {
        _count: {
          id: 'desc',  // Order by count descending (most used first)
        },
      },
    });

    // The first item in the array is the most used transport
    const mostUsedTransport = transportGroups[0]?.transportMode || 'N/A';

    // Return all the calculated stats as an object
    return {
      totalTrips,
      totalSegments,
      // Use || 0 to handle null case (no segments = 0 distance)
      totalDistanceKm: distanceAndCarbon._sum.distance || 0,
      totalCarbonKg: distanceAndCarbon._sum.carbonFootprint || 0,
      countriesVisited: countryCodesSet.size,  // Size of Set = unique count
      citiesVisited: cityNamesSet.size,
      mostUsedTransport,
    };
  }

  // ==========================================
  // DEMO OVERVIEW (public — no auth required)
  // ==========================================
  async getDemoOverview() {
    const demoUser = await this.prisma.user.findUnique({
      where: { email: 'demo@worldfootprint.com' },
    });
    if (!demoUser) return null;
    return this.getOverview(demoUser.id);
  }

  // ==========================================
  // DEMO FULL STATS (public — no auth required)
  // ==========================================
  async getDemoFull() {
    const demoUser = await this.prisma.user.findUnique({
      where: { email: 'demo@worldfootprint.com' },
    });
    if (!demoUser) return null;
    const [overview, byTransport, countries, byYear, repeatedRoutes, carbonBreakdown] =
      await Promise.all([
        this.getOverview(demoUser.id),
        this.getByTransport(demoUser.id),
        this.getCountries(demoUser.id),
        this.getByYear(demoUser.id),
        this.getRepeatedRoutes(demoUser.id),
        this.getCarbonBreakdown(demoUser.id),
      ]);
    return { overview, ...byTransport, ...countries, ...byYear, ...repeatedRoutes, carbonBreakdown };
  }

  // ==========================================
  // 2. BY TRANSPORT MODE
  // ==========================================
  // Returns breakdown of distance/carbon by each transport mode
  async getByTransport(userId: string) {
    // Group segments by transport mode and sum distance/carbon for each
    const transportData = await this.prisma.segment.groupBy({
      by: ['transportMode'],  // Group by transport type
      where: {
        trip: { userId },
      },
      _count: {
        id: true,  // Count segments per mode
      },
      _sum: {
        distance: true,        // Sum distance per mode
        carbonFootprint: true, // Sum carbon per mode
      },
    });

    // Calculate total distance across all modes (for percentages)
    const totalDistance = transportData.reduce(
      (sum, item) => sum + (item._sum.distance || 0),
      0  // Start at 0
    );

    // Transform the data to add percentages and clean up structure
    // map() transforms each item in the array
    const byTransport = transportData.map((item) => ({
      mode: item.transportMode,
      segmentCount: item._count.id,
      totalDistanceKm: item._sum.distance || 0,
      totalCarbonKg: item._sum.carbonFootprint || 0,
      // Calculate percentage: (this mode's distance / total distance) * 100
      // toFixed(1) rounds to 1 decimal place
      percentOfTotal:
        totalDistance > 0
          ? parseFloat(((item._sum.distance || 0) / totalDistance * 100).toFixed(1))
          : 0,
    }));

    // Sort by distance (highest first)
    byTransport.sort((a, b) => b.totalDistanceKm - a.totalDistanceKm);

    return { byTransport };
  }

  // ==========================================
  // 3. COUNTRIES VISITED
  // ==========================================
  // Returns list of countries with visit counts and cities
  async getCountries(userId: string) {
    // Get all segments with origin and destination places
    const segments = await this.prisma.segment.findMany({
      where: {
        trip: { userId },
      },
      include: {
        origin: true,
        destination: true,
      },
    });

    // Create a Map to store country data
    // Map key = countryCode, value = { countryName, cities: Set, visitCount }
    const countryMap = new Map<
      string,
      { countryName: string; cities: Set<string>; visitCount: number }
    >();

    // Loop through all segments and count visits per country
    segments.forEach((segment) => {
      // Process origin country
      const originCode = segment.origin.countryCode;
      if (!countryMap.has(originCode)) {
        // First time seeing this country - create entry
        countryMap.set(originCode, {
          countryName: segment.origin.countryName,
          cities: new Set([segment.origin.name]),
          visitCount: 1,
        });
      } else {
        // Already seen this country - update it
        const country = countryMap.get(originCode)!;
        country.cities.add(segment.origin.name);  // Add city (Set prevents duplicates)
        country.visitCount++;
      }

      // Process destination country (same logic)
      const destCode = segment.destination.countryCode;
      if (!countryMap.has(destCode)) {
        countryMap.set(destCode, {
          countryName: segment.destination.countryName,
          cities: new Set([segment.destination.name]),
          visitCount: 1,
        });
      } else {
        const country = countryMap.get(destCode)!;
        country.cities.add(segment.destination.name);
        country.visitCount++;
      }
    });

    // Convert Map to array and transform Sets to arrays
    const countries = Array.from(countryMap.entries()).map(
      ([countryCode, data]) => ({
        countryCode,
        countryName: data.countryName,
        visitCount: data.visitCount,
        cities: Array.from(data.cities),  // Convert Set to Array
      })
    );

    // Sort by visit count (most visited first)
    countries.sort((a, b) => b.visitCount - a.visitCount);

    return {
      countries,
      totalCountries: countries.length,
    };
  }

  // ==========================================
  // 4. BY YEAR
  // ==========================================
  // Returns year-over-year comparison
  async getByYear(userId: string) {
    // Get all trips with their segments
    const trips = await this.prisma.trip.findMany({
      where: { userId },
      include: {
        segments: {
          include: {
            origin: true,
            destination: true,
          },
        },
      },
    });

    // Create a Map to store data per year
    // Map key = year (number), value = { trips: Set, distance, carbon, countries: Set }
    const yearMap = new Map<
      number,
      {
        tripIds: Set<string>;
        distance: number;
        carbon: number;
        countries: Set<string>;
      }
    >();

    // Loop through trips and group by year
    trips.forEach((trip) => {
      // Extract year from startDate
      // If no startDate, skip this trip
      if (!trip.startDate) return;

      const year = trip.startDate.getFullYear();

      // Initialize year data if first time seeing this year
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          tripIds: new Set(),
          distance: 0,
          carbon: 0,
          countries: new Set(),
        });
      }

      const yearData = yearMap.get(year)!;
      yearData.tripIds.add(trip.id);  // Track unique trips

      // Add up distance and carbon from all segments in this trip
      trip.segments.forEach((segment) => {
        yearData.distance += segment.distance || 0;
        yearData.carbon += segment.carbonFootprint || 0;
        // Add countries from origin and destination
        yearData.countries.add(segment.origin.countryCode);
        yearData.countries.add(segment.destination.countryCode);
      });
    });

    // Convert Map to array
    const byYear = Array.from(yearMap.entries()).map(([year, data]) => ({
      year,
      trips: data.tripIds.size,  // Count unique trips
      distanceKm: Math.round(data.distance),  // Round to whole number
      carbonKg: Math.round(data.carbon),
      countries: data.countries.size,  // Count unique countries
    }));

    // Sort by year descending (most recent first)
    byYear.sort((a, b) => b.year - a.year);

    return { byYear };
  }

  // ==========================================
  // 5. REPEATED ROUTES
  // ==========================================
  // Finds routes traveled multiple times
  async getRepeatedRoutes(userId: string) {
    // Get all segments for this user
    const segments = await this.prisma.segment.findMany({
      where: {
        trip: { userId },
      },
      include: {
        origin: true,
        destination: true,
      },
    });

    // Create a Map to group segments by route
    // Map key = "originId-destinationId", value = array of segments
    const routeMap = new Map<string, typeof segments>();

    segments.forEach((segment) => {
      // Create unique key for this route
      const routeKey = `${segment.originId}-${segment.destinationId}`;

      if (!routeMap.has(routeKey)) {
        routeMap.set(routeKey, []);
      }

      routeMap.get(routeKey)!.push(segment);
    });

    // Filter to only routes traveled more than once
    // Convert to array and transform
    const repeatedRoutes = Array.from(routeMap.entries())
      .filter(([_, segmentsList]) => segmentsList.length > 1)  // Only if traveled 2+ times
      .map(([_routeKey, segmentsList]) => {
        // Get unique transport modes used for this route
        const modesSet = new Set(segmentsList.map((s) => s.transportMode));

        // Sum total distance
        const totalDistance = segmentsList.reduce(
          (sum, s) => sum + (s.distance || 0),
          0
        );

        // Calculate average carbon per trip
        const totalCarbon = segmentsList.reduce(
          (sum, s) => sum + (s.carbonFootprint || 0),
          0
        );
        const avgCarbon = totalCarbon / segmentsList.length;

        // Use first segment to get place names (all segments have same origin/dest)
        const first = segmentsList[0];

        return {
          origin: first.origin.name,
          destination: first.destination.name,
          timesTraveled: segmentsList.length,
          totalDistanceKm: Math.round(totalDistance),
          transportModes: Array.from(modesSet),
          avgCarbonPerTrip: Math.round(avgCarbon),
        };
      });

    // Sort by times traveled (most frequent first)
    repeatedRoutes.sort((a, b) => b.timesTraveled - a.timesTraveled);

    return { repeatedRoutes };
  }

  // ==========================================
  // 6. CARBON BREAKDOWN
  // ==========================================
  // Environmental impact analysis
  async getCarbonBreakdown(userId: string) {
    // Get total carbon
    const totalResult = await this.prisma.segment.aggregate({
      where: {
        trip: { userId },
      },
      _sum: {
        carbonFootprint: true,
      },
    });

    const totalCarbonKg = totalResult._sum.carbonFootprint || 0;

    // Group by transport mode
    const byTransport = await this.prisma.segment.groupBy({
      by: ['transportMode'],
      where: {
        trip: { userId },
      },
      _sum: {
        carbonFootprint: true,
      },
    });

    // Transform and add percentages
    const carbonByTransport = byTransport.map((item) => ({
      mode: item.transportMode,
      carbonKg: Math.round(item._sum.carbonFootprint || 0),
      percentOfTotal:
        totalCarbonKg > 0
          ? parseFloat(
              (((item._sum.carbonFootprint || 0) / totalCarbonKg) * 100).toFixed(1)
            )
          : 0,
    }));

    // Sort by carbon (highest first)
    carbonByTransport.sort((a, b) => b.carbonKg - a.carbonKg);

    // Environmental comparisons
    // Average tree absorbs ~20kg CO2 per year
    const equivalentTreesNeeded = Math.round(totalCarbonKg / 20);

    // Average car emits ~0.411 kg CO2 per mile
    const equivalentCarMiles = Math.round(totalCarbonKg / 0.411);

    return {
      totalCarbonKg: Math.round(totalCarbonKg),
      byTransport: carbonByTransport,
      comparison: {
        equivalentTreesNeeded,
        equivalentCarMiles,
      },
    };
  }
}