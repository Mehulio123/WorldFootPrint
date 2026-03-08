import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';  // Import

@Injectable()
export class AppService {
  // Dependency Injection: NestJS gives us PrismaService
  constructor(private prisma: PrismaService) {}

  async getHello() {
    // Now we can use this.prisma!
    const userCount = await this.prisma.user.count();
    const tripCount = await this.prisma.trip.count();
    
    return {
      message: 'Travel Footprint API',
      database: {
        connected: true,
        users: userCount,
        trips: tripCount,
      },
    };
  }
}
