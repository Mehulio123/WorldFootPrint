import 'dotenv/config'; 
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter});
async function main() {
    console.log('🌱 Seeding database...');
    
    // Create seed user
    const user = await prisma.user.create({
        data: {
            email: "ankit@example.com",
            password: "Password123",
            name: "Ankit",
            homeCity: "New York",
        }
    });
    console.log("✅ User created:", user.email);

    // Create ALL places first (before trip references them)
    const tokyo = await prisma.place.create({
        data: {
            name: 'Tokyo',
            type: 'city',
            countryCode: 'JP',
            countryName: 'Japan',
            latitude: 35.6762,
            longitude: 139.6503,
            displayName: 'Tokyo, Japan',
        },
    });

    const london = await prisma.place.create({
        data: {
            name: 'London',
            type: 'city',
            countryCode: 'GB',
            countryName: 'United Kingdom',
            latitude: 51.5074,
            longitude: -0.1278,
            displayName: 'London, United Kingdom',
        },
    });

    const paris = await prisma.place.create({
        data: {
            name: 'Paris',
            type: 'city',
            countryCode: 'FR',
            countryName: 'France',
            latitude: 48.8566,
            longitude: 2.3522,
            displayName: 'Paris, France',
        },
    });

    const barcelona = await prisma.place.create({
        data: {
            name: 'Barcelona',
            type: 'city',
            countryCode: 'ES',
            countryName: 'Spain',
            latitude: 41.3851,
            longitude: 2.1734,
            displayName: 'Barcelona, Spain',
        },
    });

    const nyc = await prisma.place.create({
        data: {
            name: 'New York City',
            type: 'city',
            countryCode: 'US',
            countryName: 'United States',
            latitude: 40.7128,
            longitude: -74.0060,
            displayName: 'New York City, United States',
        },
    });

    console.log('✅ Created 5 places');

    // Now create trip with segments (referencing places by ID)
    const europeTrip = await prisma.trip.create({
        data: {
            title: 'Europe Summer 2024',
            description: 'Backpacking through Western Europe',
            startDate: new Date('2024-06-15'),
            endDate: new Date('2024-07-05'),
            userId: user.id,
            isPublic: true,
            shareToken: 'demo-europe-2024',
            segments: {
                create: [
                    {
                        originId: nyc.id,
                        destinationId: london.id,
                        transportMode: 'flight',
                        distance: 5571,
                        carbonFootprint: 1420.6,
                        departureTime: new Date('2024-06-15T20:00:00'),
                        arrivalTime: new Date('2024-06-16T08:00:00'),
                        order: 1,
                    },
                    {
                        originId: london.id,
                        destinationId: paris.id,
                        transportMode: 'train',
                        distance: 344,
                        carbonFootprint: 14.1,
                        departureTime: new Date('2024-06-20T10:30:00'),
                        arrivalTime: new Date('2024-06-20T13:00:00'),
                        order: 2,
                    },
                    {
                        originId: paris.id,
                        destinationId: barcelona.id,
                        transportMode: 'train',
                        distance: 831,
                        carbonFootprint: 34.1,
                        departureTime: new Date('2024-06-25T09:00:00'),
                        arrivalTime: new Date('2024-06-25T15:30:00'),
                        order: 3,
                    },
                    {
                        originId: barcelona.id,
                        destinationId: nyc.id,
                        transportMode: 'flight',
                        distance: 5996,
                        carbonFootprint: 1529.0,
                        departureTime: new Date('2024-07-05T11:00:00'),
                        arrivalTime: new Date('2024-07-05T14:30:00'),
                        order: 4,
                    },
                ],
            },
        },
    });

    console.log('✅ Created Europe trip with 4 segments');

    // Create second trip (shows repeated route pattern)
    const asiaTrip = await prisma.trip.create({
        data: {
            title: 'Tokyo Business Trip',
            description: 'Client meetings in Japan',
            startDate: new Date('2024-09-10'),
            endDate: new Date('2024-09-17'),
            userId: user.id,
            isPublic: false,
            segments: {
                create: [
                    {
                        originId: nyc.id,
                        destinationId: tokyo.id,
                        transportMode: 'flight',
                        distance: 10850,
                        carbonFootprint: 2766.8,
                        departureTime: new Date('2024-09-10T16:00:00'),
                        arrivalTime: new Date('2024-09-11T19:00:00'),
                        order: 1,
                    },
                    {
                        originId: tokyo.id,
                        destinationId: nyc.id,
                        transportMode: 'flight',
                        distance: 10850,
                        carbonFootprint: 2766.8,
                        departureTime: new Date('2024-09-17T14:00:00'),
                        arrivalTime: new Date('2024-09-17T13:00:00'),
                        order: 2,
                    },
                ],
            },
        },
    });

    console.log('✅ Created Asia trip with 2 segments');

    // Print summary
    const totalSegments = await prisma.segment.count();
    const totalDistance = await prisma.segment.aggregate({
        _sum: { distance: true },
    });
    const totalCarbon = await prisma.segment.aggregate({
        _sum: { carbonFootprint: true },
    });

    console.log('\n📊 Demo Data Summary:');
    console.log(`   User: ${user.email}`);
    console.log(`   Trips: 2`);
    console.log(`   Places: 5`);
    console.log(`   Segments: ${totalSegments}`);
    console.log(`   Total Distance: ${totalDistance._sum.distance?.toFixed(0)} km`);
    console.log(`   Total Carbon: ${totalCarbon._sum.carbonFootprint?.toFixed(1)} kg CO2`);
    console.log(`   Countries Visited: 5 (US, UK, FR, ES, JP)`);
    console.log('\n🎉 Seeding complete!\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });