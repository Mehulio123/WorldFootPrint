//central point for backend to ping database!!!
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from root (one level up from backend)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

@Injectable()//saying this can be added to other classes
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // making a class in typescript that we can re-use to ping database
  private pool: Pool; //we store the connection here

  constructor() { //creating postgre connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();//connecting to database
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();//disconnect from database
    await this.pool.end();
    console.log('👋 Database disconnected');
  }
}