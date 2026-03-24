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
  const R = 6371;
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
  console.log('🌱 Starting detailed seed...');

  await prisma.segment.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  const user = await prisma.user.create({
    data: {
      email: 'demo@worldfootprint.com',
      name: 'Demo Traveler',
      password: '$2b$10$hashedpassword',
      homeCity: 'New York',
    },
  });

  console.log('👤 Created demo user');

  // COMPREHENSIVE PLACES - Including train stations, stops, and waypoints
  const placesData = [
    // === EUROPEAN RAIL NETWORK ===
    // Major Cities
    { name: 'London St Pancras', countryCode: 'GB', countryName: 'United Kingdom', latitude: 51.5308, longitude: -0.1238 },
    { name: 'Paris Gare du Nord', countryCode: 'FR', countryName: 'France', latitude: 48.8809, longitude: 2.3553 },
    { name: 'Brussels Midi', countryCode: 'BE', countryName: 'Belgium', latitude: 50.8357, longitude: 4.3361 },
    { name: 'Amsterdam Centraal', countryCode: 'NL', countryName: 'Netherlands', latitude: 52.3791, longitude: 4.9003 },
    { name: 'Berlin Hauptbahnhof', countryCode: 'DE', countryName: 'Germany', latitude: 52.5251, longitude: 13.3694 },
    { name: 'Munich Hauptbahnhof', countryCode: 'DE', countryName: 'Germany', latitude: 48.1402, longitude: 11.5581 },
    { name: 'Vienna Hauptbahnhof', countryCode: 'AT', countryName: 'Austria', latitude: 48.1849, longitude: 16.3781 },
    { name: 'Prague Main Station', countryCode: 'CZ', countryName: 'Czech Republic', latitude: 50.0830, longitude: 14.4353 },
    { name: 'Budapest Keleti', countryCode: 'HU', countryName: 'Hungary', latitude: 47.5000, longitude: 19.0833 },
    
    // Intermediate stops - Germany
    { name: 'Frankfurt Hbf', countryCode: 'DE', countryName: 'Germany', latitude: 50.1070, longitude: 8.6633 },
    { name: 'Cologne Hbf', countryCode: 'DE', countryName: 'Germany', latitude: 50.9430, longitude: 6.9589 },
    { name: 'Hamburg Hbf', countryCode: 'DE', countryName: 'Germany', latitude: 53.5528, longitude: 10.0067 },
    { name: 'Dresden Hbf', countryCode: 'DE', countryName: 'Germany', latitude: 51.0404, longitude: 13.7320 },
    
    // Intermediate stops - France
    { name: 'Lyon Part-Dieu', countryCode: 'FR', countryName: 'France', latitude: 45.7603, longitude: 4.8592 },
    { name: 'Marseille St-Charles', countryCode: 'FR', countryName: 'France', latitude: 43.3026, longitude: 5.3806 },
    { name: 'Bordeaux St-Jean', countryCode: 'FR', countryName: 'France', latitude: 44.8262, longitude: -0.5560 },
    { name: 'Lille Europe', countryCode: 'FR', countryName: 'France', latitude: 50.6387, longitude: 3.0756 },
    
    // Switzerland stops
    { name: 'Zurich HB', countryCode: 'CH', countryName: 'Switzerland', latitude: 47.3782, longitude: 8.5397 },
    { name: 'Geneva Cornavin', countryCode: 'CH', countryName: 'Switzerland', latitude: 46.2104, longitude: 6.1421 },
    { name: 'Bern Bahnhof', countryCode: 'CH', countryName: 'Switzerland', latitude: 46.9490, longitude: 7.4395 },
    { name: 'Interlaken Ost', countryCode: 'CH', countryName: 'Switzerland', latitude: 46.6863, longitude: 7.8632 },
    
    // Italy stops
    { name: 'Milan Centrale', countryCode: 'IT', countryName: 'Italy', latitude: 45.4865, longitude: 9.2040 },
    { name: 'Rome Termini', countryCode: 'IT', countryName: 'Italy', latitude: 41.9010, longitude: 12.5017 },
    { name: 'Florence SMN', countryCode: 'IT', countryName: 'Italy', latitude: 43.7763, longitude: 11.2475 },
    { name: 'Venice Santa Lucia', countryCode: 'IT', countryName: 'Italy', latitude: 45.4408, longitude: 12.3215 },
    { name: 'Bologna Centrale', countryCode: 'IT', countryName: 'Italy', latitude: 44.5061, longitude: 11.3427 },
    
    // Spain stops
    { name: 'Madrid Atocha', countryCode: 'ES', countryName: 'Spain', latitude: 40.4068, longitude: -3.6919 },
    { name: 'Barcelona Sants', countryCode: 'ES', countryName: 'Spain', latitude: 41.3793, longitude: 2.1404 },
    { name: 'Seville Santa Justa', countryCode: 'ES', countryName: 'Spain', latitude: 37.3920, longitude: -5.9766 },
    { name: 'Valencia Joaquín Sorolla', countryCode: 'ES', countryName: 'Spain', latitude: 39.4665, longitude: -0.3773 },
    
    // Scandinavia
    { name: 'Copenhagen Central', countryCode: 'DK', countryName: 'Denmark', latitude: 55.6726, longitude: 12.5648 },
    { name: 'Stockholm Central', countryCode: 'SE', countryName: 'Sweden', latitude: 59.3301, longitude: 18.0586 },
    { name: 'Oslo S', countryCode: 'NO', countryName: 'Norway', latitude: 59.9111, longitude: 10.7506 },
    
    // Austria intermediate
    { name: 'Salzburg Hbf', countryCode: 'AT', countryName: 'Austria', latitude: 47.8130, longitude: 13.0460 },
    { name: 'Innsbruck Hbf', countryCode: 'AT', countryName: 'Austria', latitude: 47.2632, longitude: 11.4010 },
    
    // === ROAD TRIP WAYPOINTS - USA West Coast ===
    { name: 'Los Angeles Downtown', countryCode: 'US', countryName: 'United States', latitude: 34.0522, longitude: -118.2437 },
    { name: 'Santa Barbara', countryCode: 'US', countryName: 'United States', latitude: 34.4208, longitude: -119.6982 },
    { name: 'San Luis Obispo', countryCode: 'US', countryName: 'United States', latitude: 35.2828, longitude: -120.6596 },
    { name: 'Big Sur', countryCode: 'US', countryName: 'United States', latitude: 36.2704, longitude: -121.8081 },
    { name: 'Monterey', countryCode: 'US', countryName: 'United States', latitude: 36.6002, longitude: -121.8947 },
    { name: 'San Jose', countryCode: 'US', countryName: 'United States', latitude: 37.3387, longitude: -121.8853 },
    { name: 'San Francisco Downtown', countryCode: 'US', countryName: 'United States', latitude: 37.7749, longitude: -122.4194 },
    
    // === ASIA ===
    { name: 'Tokyo Station', countryCode: 'JP', countryName: 'Japan', latitude: 35.6812, longitude: 139.7671 },
    { name: 'Kyoto Station', countryCode: 'JP', countryName: 'Japan', latitude: 34.9857, longitude: 135.7582 },
    { name: 'Osaka Station', countryCode: 'JP', countryName: 'Japan', latitude: 34.7024, longitude: 135.4959 },
    { name: 'Nagoya Station', countryCode: 'JP', countryName: 'Japan', latitude: 35.1706, longitude: 136.8816 },
    { name: 'Hiroshima Station', countryCode: 'JP', countryName: 'Japan', latitude: 34.3975, longitude: 132.4756 },
    
    { name: 'Seoul Station', countryCode: 'KR', countryName: 'South Korea', latitude: 37.5547, longitude: 126.9707 },
    { name: 'Busan Station', countryCode: 'KR', countryName: 'South Korea', latitude: 35.1151, longitude: 129.0416 },
    
    { name: 'Beijing South Station', countryCode: 'CN', countryName: 'China', latitude: 39.8650, longitude: 116.3785 },
    { name: 'Shanghai Hongqiao', countryCode: 'CN', countryName: 'China', latitude: 31.1979, longitude: 121.3157 },
    
    { name: 'Hong Kong Central', countryCode: 'HK', countryName: 'Hong Kong', latitude: 22.2819, longitude: 114.1580 },
    { name: 'Singapore Central', countryCode: 'SG', countryName: 'Singapore', latitude: 1.2897, longitude: 103.8501 },
    { name: 'Bangkok Hua Lamphong', countryCode: 'TH', countryName: 'Thailand', latitude: 13.7374, longitude: 100.5169 },
    { name: 'Kuala Lumpur Sentral', countryCode: 'MY', countryName: 'Malaysia', latitude: 3.1334, longitude: 101.6869 },
    
    // India
    { name: 'Delhi Railway Station', countryCode: 'IN', countryName: 'India', latitude: 28.6415, longitude: 77.2194 },
    { name: 'Mumbai CST', countryCode: 'IN', countryName: 'India', latitude: 18.9398, longitude: 72.8355 },
    { name: 'Agra Cantt', countryCode: 'IN', countryName: 'India', latitude: 27.1591, longitude: 78.0015 },
    { name: 'Jaipur Junction', countryCode: 'IN', countryName: 'India', latitude: 26.9185, longitude: 75.7878 },
    
    // Middle East
    { name: 'Dubai Marina', countryCode: 'AE', countryName: 'UAE', latitude: 25.0805, longitude: 55.1396 },
    { name: 'Abu Dhabi Central', countryCode: 'AE', countryName: 'UAE', latitude: 24.4539, longitude: 54.3773 },
    
    // === OCEANIA ===
    { name: 'Sydney Central', countryCode: 'AU', countryName: 'Australia', latitude: -33.8830, longitude: 151.2063 },
    { name: 'Melbourne Southern Cross', countryCode: 'AU', countryName: 'Australia', latitude: -37.8183, longitude: 144.9525 },
    { name: 'Brisbane Central', countryCode: 'AU', countryName: 'Australia', latitude: -27.4654, longitude: 153.0278 },
    { name: 'Auckland Britomart', countryCode: 'NZ', countryName: 'New Zealand', latitude: -36.8441, longitude: 174.7679 },
    
    // === SOUTH AMERICA ===
    { name: 'São Paulo Luz', countryCode: 'BR', countryName: 'Brazil', latitude: -23.5349, longitude: -46.6356 },
    { name: 'Rio Central', countryCode: 'BR', countryName: 'Brazil', latitude: -22.9019, longitude: -43.1906 },
    { name: 'Buenos Aires Retiro', countryCode: 'AR', countryName: 'Argentina', latitude: -34.5906, longitude: -58.3740 },
    { name: 'Lima Centro', countryCode: 'PE', countryName: 'Peru', latitude: -12.0464, longitude: -77.0298 },
    
    // === AFRICA ===
    { name: 'Cairo Ramses', countryCode: 'EG', countryName: 'Egypt', latitude: 30.0626, longitude: 31.2472 },
    { name: 'Nairobi Central', countryCode: 'KE', countryName: 'Kenya', latitude: -1.2841, longitude: 36.8227 },
    { name: 'Cape Town Station', countryCode: 'ZA', countryName: 'South Africa', latitude: -33.9275, longitude: 18.4282 },
    { name: 'Johannesburg Park', countryCode: 'ZA', countryName: 'South Africa', latitude: -26.1936, longitude: 28.0384 },
    { name: 'Marrakech Station', countryCode: 'MA', countryName: 'Morocco', latitude: 31.6220, longitude: -8.0089 },
    { name: 'Casablanca Voyageurs', countryCode: 'MA', countryName: 'Morocco', latitude: 33.5903, longitude: -7.5895 },
    
    // === NORTH AMERICA ===
    { name: 'New York Penn Station', countryCode: 'US', countryName: 'United States', latitude: 40.7506, longitude: -73.9935 },
    { name: 'Philadelphia 30th Street', countryCode: 'US', countryName: 'United States', latitude: 39.9566, longitude: -75.1815 },
    { name: 'Washington Union Station', countryCode: 'US', countryName: 'United States', latitude: 38.8977, longitude: -77.0063 },
    { name: 'Boston South Station', countryCode: 'US', countryName: 'United States', latitude: 42.3519, longitude: -71.0552 },
    
    { name: 'Toronto Union', countryCode: 'CA', countryName: 'Canada', latitude: 43.6455, longitude: -79.3805 },
    { name: 'Montreal Central', countryCode: 'CA', countryName: 'Canada', latitude: 45.4995, longitude: -73.5669 },
    { name: 'Vancouver Pacific Central', countryCode: 'CA', countryName: 'Canada', latitude: 49.2734, longitude: -123.0979 },
    
    { name: 'Mexico City Buenavista', countryCode: 'MX', countryName: 'Mexico', latitude: 19.4462, longitude: -99.1527 },
  ];

  const places = await Promise.all(
    placesData.map((place) => prisma.place.create({ data: place }))
  );

  console.log(`📍 Created ${places.length} places (stations & waypoints)`);

  // ULTRA-REALISTIC TRIPS WITH DETAILED ROUTING
  const tripsData = [
    {
      title: 'Trans-European Rail Journey',
      description: 'Epic train journey across Europe with realistic station stops',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-05-15'),
      isPublic: true,
      segments: [
        // London → Paris (Eurostar)
        { from: 'London St Pancras', to: 'Paris Gare du Nord', mode: 'train', date: '2024-05-01T09:00:00' },
        
        // Paris → Lyon → Marseille (TGV route)
        { from: 'Paris Gare du Nord', to: 'Lyon Part-Dieu', mode: 'train', date: '2024-05-02T10:30:00' },
        { from: 'Lyon Part-Dieu', to: 'Marseille St-Charles', mode: 'train', date: '2024-05-02T14:00:00' },
        
        // Marseille → Barcelona (via French coast)
        { from: 'Marseille St-Charles', to: 'Barcelona Sants', mode: 'train', date: '2024-05-04T08:00:00' },
        
        // Barcelona → Madrid (AVE high-speed)
        { from: 'Barcelona Sants', to: 'Madrid Atocha', mode: 'train', date: '2024-05-06T11:00:00' },
        
        // Madrid → Paris (overnight)
        { from: 'Madrid Atocha', to: 'Paris Gare du Nord', mode: 'train', date: '2024-05-08T20:00:00' },
        
        // Paris → Brussels → Amsterdam
        { from: 'Paris Gare du Nord', to: 'Brussels Midi', mode: 'train', date: '2024-05-10T09:00:00' },
        { from: 'Brussels Midi', to: 'Amsterdam Centraal', mode: 'train', date: '2024-05-10T13:00:00' },
        
        // Amsterdam → Cologne → Frankfurt → Munich
        { from: 'Amsterdam Centraal', to: 'Cologne Hbf', mode: 'train', date: '2024-05-11T10:00:00' },
        { from: 'Cologne Hbf', to: 'Frankfurt Hbf', mode: 'train', date: '2024-05-11T14:00:00' },
        { from: 'Frankfurt Hbf', to: 'Munich Hauptbahnhof', mode: 'train', date: '2024-05-12T09:00:00' },
        
        // Munich → Salzburg → Vienna
        { from: 'Munich Hauptbahnhof', to: 'Salzburg Hbf', mode: 'train', date: '2024-05-13T10:00:00' },
        { from: 'Salzburg Hbf', to: 'Vienna Hauptbahnhof', mode: 'train', date: '2024-05-13T14:00:00' },
        
        // Vienna → Prague → Berlin
        { from: 'Vienna Hauptbahnhof', to: 'Prague Main Station', mode: 'train', date: '2024-05-14T09:00:00' },
        { from: 'Prague Main Station', to: 'Berlin Hauptbahnhof', mode: 'train', date: '2024-05-14T15:00:00' },
      ],
    },
    
    {
      title: 'California Coast Road Trip',
      description: 'Pacific Coast Highway drive with scenic stops',
      startDate: new Date('2024-06-10'),
      endDate: new Date('2024-06-17'),
      isPublic: true,
      segments: [
        // LA → Santa Barbara
        { from: 'Los Angeles Downtown', to: 'Santa Barbara', mode: 'car', date: '2024-06-10T08:00:00' },
        
        // Santa Barbara → San Luis Obispo
        { from: 'Santa Barbara', to: 'San Luis Obispo', mode: 'car', date: '2024-06-11T09:00:00' },
        
        // SLO → Big Sur (scenic coastal drive)
        { from: 'San Luis Obispo', to: 'Big Sur', mode: 'car', date: '2024-06-12T10:00:00' },
        
        // Big Sur → Monterey
        { from: 'Big Sur', to: 'Monterey', mode: 'car', date: '2024-06-13T11:00:00' },
        
        // Monterey → San Jose
        { from: 'Monterey', to: 'San Jose', mode: 'car', date: '2024-06-14T14:00:00' },
        
        // San Jose → San Francisco
        { from: 'San Jose', to: 'San Francisco Downtown', mode: 'car', date: '2024-06-15T09:00:00' },
      ],
    },
    
    {
      title: 'Swiss Alps Rail Adventure',
      description: 'Scenic mountain railway journey through Switzerland',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-08'),
      isPublic: true,
      segments: [
        // Geneva → Bern
        { from: 'Geneva Cornavin', to: 'Bern Bahnhof', mode: 'train', date: '2024-07-01T09:00:00' },
        
        // Bern → Interlaken (mountain route)
        { from: 'Bern Bahnhof', to: 'Interlaken Ost', mode: 'train', date: '2024-07-02T10:00:00' },
        
        // Interlaken → Zurich
        { from: 'Interlaken Ost', to: 'Zurich HB', mode: 'train', date: '2024-07-04T11:00:00' },
        
        // Zurich → Milan (through Alps)
        { from: 'Zurich HB', to: 'Milan Centrale', mode: 'train', date: '2024-07-06T08:00:00' },
      ],
    },
    
    {
      title: 'Italian Peninsula Express',
      description: 'North to south Italy by high-speed rail',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-08-12'),
      isPublic: true,
      segments: [
        // Milan → Venice
        { from: 'Milan Centrale', to: 'Venice Santa Lucia', mode: 'train', date: '2024-08-01T10:00:00' },
        
        // Venice → Bologna
        { from: 'Venice Santa Lucia', to: 'Bologna Centrale', mode: 'train', date: '2024-08-03T11:00:00' },
        
        // Bologna → Florence
        { from: 'Bologna Centrale', to: 'Florence SMN', mode: 'train', date: '2024-08-05T09:00:00' },
        
        // Florence → Rome
        { from: 'Florence SMN', to: 'Rome Termini', mode: 'train', date: '2024-08-08T10:00:00' },
      ],
    },
    
    {
      title: 'Japanese Shinkansen Circuit',
      description: 'Bullet train tour of Japan',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-09-14'),
      isPublic: true,
      segments: [
        // Tokyo → Nagoya
        { from: 'Tokyo Station', to: 'Nagoya Station', mode: 'train', date: '2024-09-01T09:00:00' },
        
        // Nagoya → Kyoto
        { from: 'Nagoya Station', to: 'Kyoto Station', mode: 'train', date: '2024-09-03T10:00:00' },
        
        // Kyoto → Osaka
        { from: 'Kyoto Station', to: 'Osaka Station', mode: 'train', date: '2024-09-06T11:00:00' },
        
        // Osaka → Hiroshima
        { from: 'Osaka Station', to: 'Hiroshima Station', mode: 'train', date: '2024-09-09T08:00:00' },
        
        // Hiroshima → Tokyo
        { from: 'Hiroshima Station', to: 'Tokyo Station', mode: 'train', date: '2024-09-12T10:00:00' },
      ],
    },
    
    {
      title: 'India Golden Triangle Railway',
      description: 'Classic Indian rail journey',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-10'),
      isPublic: true,
      segments: [
        // Delhi → Agra
        { from: 'Delhi Railway Station', to: 'Agra Cantt', mode: 'train', date: '2024-10-01T06:00:00' },
        
        // Agra → Jaipur
        { from: 'Agra Cantt', to: 'Jaipur Junction', mode: 'train', date: '2024-10-04T09:00:00' },
        
        // Jaipur → Delhi
        { from: 'Jaipur Junction', to: 'Delhi Railway Station', mode: 'train', date: '2024-10-07T10:00:00' },
        
        // Delhi → Mumbai (overnight)
        { from: 'Delhi Railway Station', to: 'Mumbai CST', mode: 'train', date: '2024-10-08T16:00:00' },
      ],
    },
    
    {
      title: 'Morocco Rail Journey',
      description: 'Moroccan cities by train',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-11-07'),
      isPublic: true,
      segments: [
        // Casablanca → Marrakech
        { from: 'Casablanca Voyageurs', to: 'Marrakech Station', mode: 'train', date: '2024-11-01T08:00:00' },
        
        // Marrakech → Casablanca
        { from: 'Marrakech Station', to: 'Casablanca Voyageurs', mode: 'train', date: '2024-11-05T09:00:00' },
      ],
    },
    
    {
      title: 'US East Coast Amtrak',
      description: 'Northeast Corridor by rail',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-05'),
      isPublic: true,
      segments: [
        // Boston → New York
        { from: 'Boston South Station', to: 'New York Penn Station', mode: 'train', date: '2024-04-01T08:00:00' },
        
        // New York → Philadelphia
        { from: 'New York Penn Station', to: 'Philadelphia 30th Street', mode: 'train', date: '2024-04-02T10:00:00' },
        
        // Philadelphia → Washington DC
        { from: 'Philadelphia 30th Street', to: 'Washington Union Station', mode: 'train', date: '2024-04-03T11:00:00' },
      ],
    },
    
    {
      title: 'Scandinavia Express',
      description: 'Nordic capitals by train',
      startDate: new Date('2024-05-20'),
      endDate: new Date('2024-05-28'),
      isPublic: true,
      segments: [
        // Copenhagen → Stockholm
        { from: 'Copenhagen Central', to: 'Stockholm Central', mode: 'train', date: '2024-05-20T09:00:00' },
        
        // Stockholm → Oslo
        { from: 'Stockholm Central', to: 'Oslo S', mode: 'train', date: '2024-05-24T08:00:00' },
      ],
    },
    
    {
      title: 'Southeast Asia Connector',
      description: 'Flights connecting major SE Asian hubs',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-15'),
      isPublic: true,
      segments: [
        // Singapore → Bangkok
        { from: 'Singapore Central', to: 'Bangkok Hua Lamphong', mode: 'flight', date: '2024-12-01T10:00:00' },
        
        // Bangkok → Kuala Lumpur
        { from: 'Bangkok Hua Lamphong', to: 'Kuala Lumpur Sentral', mode: 'flight', date: '2024-12-05T11:00:00' },
        
        // KL → Hong Kong
        { from: 'Kuala Lumpur Sentral', to: 'Hong Kong Central', mode: 'flight', date: '2024-12-10T09:00:00' },
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
        console.warn(`⚠️  Skipping: ${seg.from} → ${seg.to}`);
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
          arrivalTime: new Date(new Date(seg.date).getTime() + distance * 60000), // Rough time calc
        },
      });
    }

    console.log(`✅ ${trip.title}: ${tripData.segments.length} segments`);
  }

  const totalSegments = tripsData.reduce((sum, t) => sum + t.segments.length, 0);

  console.log('\n🎉 Seed completed!');
  console.log(`\n📊 Summary:`);
  console.log(`   👤 Users: 1`);
  console.log(`   📍 Places: ${places.length} (detailed stations & waypoints)`);
  console.log(`   ✈️  Trips: ${tripsData.length}`);
  console.log(`   🛤️  Segments: ${totalSegments} (realistic routing)`);
  console.log(`\n🚂 Featured:`);
  console.log(`   • Trans-European Rail: 14 segments across Europe`);
  console.log(`   • California Road Trip: 6 segments along PCH`);
  console.log(`   • Japanese Shinkansen: 5 bullet train segments`);
  console.log(`   • Swiss Alps: 4 scenic mountain routes`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });