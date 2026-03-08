// Module = decorator to define a NestJS module
// Modules organize related code together (controller + service + dependencies)
import { Module } from '@nestjs/common';

// Import the controller for this module
import { TripsController } from './trips.controller';

// Import the service for this module
import { TripsService } from './trips.service';

// Import PrismaModule because TripsService needs PrismaService
import { PrismaModule } from '../prisma/prisma.module';

// @Module() = This is a module definition
// Modules are like containers that group related functionality
@Module({
  
  // imports = other modules this module needs
  // We import PrismaModule because TripsService uses PrismaService
  // This makes PrismaService available to TripsService via dependency injection
  imports: [PrismaModule],
  
  // controllers = HTTP request handlers for this module
  // NestJS will instantiate this controller and set up its routes
  controllers: [TripsController],
  
  // providers = services that can be injected
  // NestJS will create ONE instance of TripsService and share it
  // This is called the "Singleton pattern"
  providers: [TripsService],
  
  // exports = make TripsService available to OTHER modules (if needed later)
  // For now, we're not exporting anything because only TripsController uses it
  // If StatsModule wanted to use TripsService, we'd add:
  // exports: [TripsService],
})
export class TripsModule {}

// How this works:
// 1. NestJS sees TripsModule in app.module.ts imports
// 2. NestJS creates one instance of TripsService
// 3. NestJS creates one instance of TripsController
// 4. NestJS injects TripsService into TripsController's constructor
// 5. NestJS registers all routes from TripsController
// 6. When a request comes to /trips, it calls the controller method
