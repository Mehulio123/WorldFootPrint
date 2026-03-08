import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { PrismaModule } from 'src/prisma/prisma.module';  // Import our PrismaModule
@Module({
    imports: [PrismaModule],  // "I want to use PrismaModule"
    controllers: [StatsController],
    providers: [StatsService],  // "I provide StatsService"
})

export class StatsModule {}