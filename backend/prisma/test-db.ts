import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected!');
    
    const users = await prisma.user.findMany();
    console.log('Users:', users);
  } catch (e) {
    console.error('❌ Connection failed:', e);
  }
}

test().finally(() => prisma.$disconnect());