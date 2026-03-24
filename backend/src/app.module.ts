import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';  // Import our module
import { TripsModule } from './trips/trips.module';  // Import TripsModule
import { AuthModule } from './auth/auth.module';  // Import AuthModule
import { StatsModule } from './Stats/stats.module';  // Import StatsModule
import { PlacesModule } from './places/places.module';  // Import PlacesModule

@Module({
  imports: [
    PrismaModule,
    TripsModule,
    AuthModule,
    StatsModule,
    PlacesModule,
  ],  // "I want to use PrismaModule"
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}