import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],  // "I provide PrismaService"
  exports: [PrismaService],    // "Others can use PrismaService"
})
export class PrismaModule {}