import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Helper function to calculate carbon footprint
function calculateCarbon(distanceKm: number, transportMode: string): number {
  const emissionFactors: Record<string, number> = {
    flight: 0.255,
    car: 0.192,
    bus: 0.089,
    train: 0.041,
    ferry: 0.115,
    walk: 0,
    bike: 0,
  };
  const factor = emissionFactors[transportMode] || 0.255;
  return Math.round(distanceKm * factor * 10) / 10;
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.segment.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@worldfootprint.com',
      name: 'Demo User',
      password: '$2b$10$hashedpassword', // Placeholder
      homeCity: 'New York',
    },
  });

  console.log('👤 Created demo user');

  // Create comprehensive list of places
  const placesData = [
    // North America
    { name: 'New York', countryCode: 'US', countryName: 'United States', latitude: 40.7128, longitude: -74.0060 },
    { name: 'Toronto', countryCode: 'CA', countryName: 'Canada', latitude: 43.6532, longitude: -79.3832 },
    { name: 'Los Angeles', countryCode: 'US', countryName: 'United States', latitude: 34.0522, longitude: -118.2437 },
    { name: 'San Francisco', countryCode: 'US', countryName: 'United States', latitude: 37.7749, longitude: -122.4194 },
    { name: 'Mexico City', countryCode: 'MX', countryName: 'Mexico', latitude: 19.4326, longitude: -99.1332 },
    
    // Europe
    { name: 'London', countryCode: 'GB', countryName: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
    { name: 'Paris', countryCode: 'FR', countryName: 'France', latitude: 48.8566, longitude: 2.3522 },
    { name: 'Berlin', countryCode: 'DE', countryName: 'Germany', latitude: 52.5200, longitude: 13.4050 },
    { name: 'Amsterdam', countryCode: 'NL', countryName: 'Netherlands', latitude: 52.3676, longitude: 4.9041 },
    { name: 'Barcelona', countryCode: 'ES', countryName: 'Spain', latitude: 41.3851, longitude: 2.1734 },
    { name: 'Rome', countryCode: 'IT', countryName: 'Italy', latitude: 41.9028, longitude: 12.4964 },
    { name: 'Prague', countryCode: 'CZ', countryName: 'Czech Republic', latitude: 50.0755, longitude: 14.4378 },
    { name: 'Vienna', countryCode: 'AT', countryName: 'Austria', latitude: 48.2082, longitude: 16.3738 },
    { name: 'Budapest', countryCode: 'HU', countryName: 'Hungary', latitude: 47.4979, longitude: 19.0402 },
    { name: 'Istanbul', countryCode: 'TR', countryName: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
    { name: 'Athens', countryCode: 'GR', countryName: 'Greece', latitude: 37.9838, longitude: 23.7275 },
    { name: 'Lisbon', countryCode: 'PT', countryName: 'Portugal', latitude: 38.7223, longitude: -9.1393 },
    { name: 'Copenhagen', countryCode: 'DK', countryName: 'Denmark', latitude: 55.6761, longitude: 12.5683 },
    { name: 'Stockholm', countryCode: 'SE', countryName: 'Sweden', latitude: 59.3293, longitude: 18.0686 },
    
    // Asia
    { name: 'Tokyo', countryCode: 'JP', countryName: 'Japan', latitude: 35.6762, longitude: 139.6503 },
    { name: 'Osaka', countryCode: 'JP', countryName: 'Japan', latitude: 34.6937, longitude: 135.5023 },
    { name: 'Kyoto', countryCode: 'JP', countryName: 'Japan', latitude: 35.0116, longitude: 135.7681 },
    { name: 'Seoul', countryCode: 'KR', countryName: 'South Korea', latitude: 37.5665, longitude: 126.9780 },
    { name: 'Hong Kong', countryCode: 'HK', countryName: 'Hong Kong', latitude: 22.3193, longitude: 114.1694 },
    { name: 'Singapore', countryCode: 'SG', countryName: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
    { name: 'Bangkok', countryCode: 'TH', countryName: 'Thailand', latitude: 13.7563, longitude: 100.5018 },
    { name: 'Mumbai', countryCode: 'IN', countryName: 'India', latitude: 19.0760, longitude: 72.8777 },
    { name: 'Delhi', countryCode: 'IN', countryName: 'India', latitude: 28.6139, longitude: 77.2090 },
    { name: 'Dubai', countryCode: 'AE', countryName: 'UAE', latitude: 25.2048, longitude: 55.2708 },
    { name: 'Beijing', countryCode: 'CN', countryName: 'China', latitude: 39.9042, longitude: 116.4074 },
    { name: 'Shanghai', countryCode: 'CN', countryName: 'China', latitude: 31.2304, longitude: 121.4737 },
    
    // Oceania
    { name: 'Sydney', countryCode: 'AU', countryName: 'Australia', latitude: -33.8688, longitude: 151.2093 },
    { name: 'Melbourne', countryCode: 'AU', countryName: 'Australia', latitude: -37.8136, longitude: 144.9631 },
    { name: 'Auckland', countryCode: 'NZ', countryName: 'New Zealand', latitude: -36.8485, longitude: 174.7633 },
    
    // South America
    { name: 'São Paulo', countryCode: 'BR', countryName: 'Brazil', latitude: -23.5505, longitude: -46.6333 },
    { name: 'Rio de Janeiro', countryCode: 'BR', countryName: 'Brazil', latitude: -22.9068, longitude: -43.1729 },
    { name: 'Buenos Aires', countryCode: 'AR', countryName: 'Argentina', latitude: -34.6037, longitude: -58.3816 },
    { name: 'Lima', countryCode: 'PE', countryName: 'Peru', latitude: -12.0464, longitude: -77.0428 },
    
    // Africa
    { name: 'Cairo', countryCode: 'EG', countryName: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
    { name: 'Nairobi', countryCode: 'KE', countryName: 'Kenya', latitude: -1.2864, longitude: 36.8172 },
    { name: 'Cape Town', countryCode: 'ZA', countryName: 'South Africa', latitude: -33.9249, longitude: 18.4241 },
    { name: 'Marrakech', countryCode: 'MA', countryName: 'Morocco', latitude: 31.6295, longitude: -7.9811 },
  ];

  const places = await Promise.all(
    placesData.map((place) =>
      prisma.place.create({
        data: place,
      })
    )
  );

  console.log(`📍 Created ${places.length} places`);

  // Create trips with segments
  const tripsData = [
    {
      title: 'European Grand Tour',
      description: 'Classic European adventure through iconic cities',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-05-20'),
      isPublic: true,
      segments: [
        { from: 'London', to: 'Paris', mode: 'train', date: '2024-05-01' },
        { from: 'Paris', to: 'Berlin', mode: 'train', date: '2024-05-05' },
        { from: 'Berlin', to: 'Prague', mode: 'bus', date: '2024-05-08' },
        { from: 'Prague', to: 'Vienna', mode: 'train', date: '2024-05-11' },
        { from: 'Vienna', to: 'Budapest', mode: 'train', date: '2024-05-14' },
        { from: 'Budapest', to: 'Rome', mode: 'flight', date: '2024-05-17' },
      ],
    },
    {
      title: 'East Asia Explorer',
      description: 'Journey through Japan and Korea',
      startDate: new Date('2024-06-10'),
      endDate: new Date('2024-06-25'),
      isPublic: true,
      segments: [
        { from: 'Tokyo', to: 'Kyoto', mode: 'train', date: '2024-06-10' },
        { from: 'Kyoto', to: 'Osaka', mode: 'train', date: '2024-06-13' },
        { from: 'Osaka', to: 'Seoul', mode: 'flight', date: '2024-06-16' },
        { from: 'Seoul', to: 'Tokyo', mode: 'flight', date: '2024-06-22' },
      ],
    },
    {
      title: 'Southeast Asia Circuit',
      description: 'Tropical adventure through SE Asia',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-18'),
      isPublic: true,
      segments: [
        { from: 'Singapore', to: 'Bangkok', mode: 'flight', date: '2024-07-01' },
        { from: 'Bangkok', to: 'Hong Kong', mode: 'flight', date: '2024-07-06' },
        { from: 'Hong Kong', to: 'Tokyo', mode: 'flight', date: '2024-07-11' },
        { from: 'Tokyo', to: 'Singapore', mode: 'flight', date: '2024-07-15' },
      ],
    },
    {
      title: 'Trans-Atlantic Journey',
      description: 'From North America to Europe',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-08-10'),
      isPublic: true,
      segments: [
        { from: 'New York', to: 'London', mode: 'flight', date: '2024-08-01' },
        { from: 'London', to: 'Amsterdam', mode: 'train', date: '2024-08-05' },
        { from: 'Amsterdam', to: 'Paris', mode: 'train', date: '2024-08-07' },
      ],
    },
    {
      title: 'Australia & New Zealand',
      description: 'Down under adventure',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-09-15'),
      isPublic: true,
      segments: [
        { from: 'Sydney', to: 'Melbourne', mode: 'flight', date: '2024-09-01' },
        { from: 'Melbourne', to: 'Auckland', mode: 'flight', date: '2024-09-08' },
        { from: 'Auckland', to: 'Sydney', mode: 'flight', date: '2024-09-12' },
      ],
    },
    {
      title: 'South American Adventure',
      description: 'Exploring the southern continent',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-14'),
      isPublic: true,
      segments: [
        { from: 'São Paulo', to: 'Rio de Janeiro', mode: 'bus', date: '2024-10-01' },
        { from: 'Rio de Janeiro', to: 'Buenos Aires', mode: 'flight', date: '2024-10-05' },
        { from: 'Buenos Aires', to: 'Lima', mode: 'flight', date: '2024-10-10' },
      ],
    },
    {
      title: 'Scandinavian Explorer',
      description: 'Nordic countries tour',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-11-10'),
      isPublic: true,
      segments: [
        { from: 'Copenhagen', to: 'Stockholm', mode: 'train', date: '2024-11-01' },
        { from: 'Stockholm', to: 'Berlin', mode: 'flight', date: '2024-11-06' },
      ],
    },
    {
      title: 'Middle East & India',
      description: 'Cultural journey through Asia',
      startDate: new Date('2023-12-01'),
      endDate: new Date('2023-12-20'),
      isPublic: true,
      segments: [
        { from: 'Dubai', to: 'Mumbai', mode: 'flight', date: '2023-12-01' },
        { from: 'Mumbai', to: 'Delhi', mode: 'flight', date: '2023-12-05' },
        { from: 'Delhi', to: 'Dubai', mode: 'flight', date: '2023-12-15' },
      ],
    },
    {
      title: 'Mediterranean Cruise',
      description: 'Coastal cities of the Mediterranean',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-12'),
      isPublic: true,
      segments: [
        { from: 'Barcelona', to: 'Rome', mode: 'ferry', date: '2024-04-01' },
        { from: 'Rome', to: 'Athens', mode: 'ferry', date: '2024-04-05' },
        { from: 'Athens', to: 'Istanbul', mode: 'ferry', date: '2024-04-09' },
      ],
    },
    {
      title: 'North American Road Trip',
      description: 'West Coast USA journey',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-25'),
      isPublic: true,
      segments: [
        { from: 'Los Angeles', to: 'San Francisco', mode: 'car', date: '2024-03-15' },
        { from: 'San Francisco', to: 'New York', mode: 'flight', date: '2024-03-20' },
      ],
    },
  ];

  for (const tripData of tripsData) {
    const trip = await prisma.trip.create({
      data: {
        title: tripData.title,
        description: tripData.description,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        isPublic: tripData.isPublic,
        userId: user.id,
      },
    });

    for (const seg of tripData.segments) {
      const origin = places.find((p) => p.name === seg.from);
      const destination = places.find((p) => p.name === seg.to);

      if (!origin || !destination) {
        console.warn(`⚠️  Skipping segment: ${seg.from} -> ${seg.to} (place not found)`);
        continue;
      }

      const distance = calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );

      const carbon = calculateCarbon(distance, seg.mode);

      await prisma.segment.create({
        data: {
          tripId: trip.id,
          originId: origin.id,
          destinationId: destination.id,
          transportMode: seg.mode,
          distance,
          carbonFootprint: carbon,
          departureTime: new Date(seg.date),
          arrivalTime: new Date(new Date(seg.date).getTime() + 3600000), // +1 hour
        },
      });
    }

    console.log(`✅ Created trip: ${trip.title} with ${tripData.segments.length} segments`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   👤 Users: 1`);
  console.log(`   📍 Places: ${places.length}`);
  console.log(`   ✈️  Trips: ${tripsData.length}`);
  console.log(`   🛤️  Segments: ${tripsData.reduce((sum, t) => sum + t.segments.length, 0)}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });