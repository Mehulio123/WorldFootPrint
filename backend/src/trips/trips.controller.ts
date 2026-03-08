import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('trips')
@UseGuards(JwtAuthGuard)  // All routes require authentication
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // ==========================================
  // GET /trips
  // Get all trips for logged-in user
  // ==========================================
  @Get()
  async getAllTrips(@Request() req: any) {
    return await this.tripsService.getTripsByUser(req.user.userId);
  }

  // ==========================================
  // POST /trips
  // Create new trip
  // ==========================================
  @Post()
  async createTrip(
    @Request() req: any,
    @Body() body: {
      title: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      isPublic?: boolean;
    }
  ) {
    return await this.tripsService.createTrip(req.user.userId, {
      title: body.title,
      description: body.description,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isPublic: body.isPublic,
    });
  }

  // ==========================================
  // POST /trips/recalculate
  // Recalculate all segments for current user
  // NOTE: must be before /:id to avoid route conflict
  // ==========================================
  @Post('recalculate')
  async recalculateAll(@Request() req: any) {
    return await this.tripsService.recalculateAllSegments(req.user.userId);
  }

  // ==========================================
  // PUT /trips/segments/:segmentId
  // Update segment (AUTO-RECALCULATES if needed!)
  // NOTE: must be before /:id to avoid route conflict
  // ==========================================
  @Put('segments/:segmentId')
  async updateSegment(
    @Param('segmentId') segmentId: string,
    @Request() req: any,
    @Body() body: {
      originId?: string;
      destinationId?: string;
      transportMode?: string;
      departureTime?: string;
      arrivalTime?: string;
      notes?: string;
      order?: number;
    }
  ) {
    return await this.tripsService.updateSegment(segmentId, req.user.userId, {
      originId: body.originId,
      destinationId: body.destinationId,
      transportMode: body.transportMode,
      departureTime: body.departureTime ? new Date(body.departureTime) : undefined,
      arrivalTime: body.arrivalTime ? new Date(body.arrivalTime) : undefined,
      notes: body.notes,
      order: body.order,
    });
  }

  // ==========================================
  // DELETE /trips/segments/:segmentId
  // Delete segment
  // NOTE: must be before /:id to avoid route conflict
  // ==========================================
  @Delete('segments/:segmentId')
  async deleteSegment(@Param('segmentId') segmentId: string, @Request() req: any) {
    return await this.tripsService.deleteSegment(segmentId, req.user.userId);
  }

  // ==========================================
  // GET /trips/:id
  // Get single trip by ID
  // ==========================================
  @Get(':id')
  async getTripById(@Param('id') id: string, @Request() req: any) {
    return await this.tripsService.getTripById(id, req.user.userId);
  }

  // ==========================================
  // PUT /trips/:id
  // Update trip
  // ==========================================
  @Put(':id')
  async updateTrip(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: {
      title?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      isPublic?: boolean;
    }
  ) {
    return await this.tripsService.updateTrip(id, req.user.userId, {
      title: body.title,
      description: body.description,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isPublic: body.isPublic,
    });
  }

  // ==========================================
  // DELETE /trips/:id
  // Delete trip
  // ==========================================
  @Delete(':id')
  async deleteTrip(@Param('id') id: string, @Request() req: any) {
    return await this.tripsService.deleteTrip(id, req.user.userId);
  }

  // ==========================================
  // POST /trips/:id/segments
  // Add segment to trip (AUTO-CALCULATES distance & carbon!)
  // ==========================================
  @Post(':id/segments')
  async addSegment(
    @Param('id') tripId: string,
    @Request() req: any,
    @Body() body: {
      originId: string;
      destinationId: string;
      transportMode: string;
      departureTime?: string;
      arrivalTime?: string;
      notes?: string;
      order?: number;
    }
  ) {
    return await this.tripsService.addSegment(tripId, req.user.userId, {
      originId: body.originId,
      destinationId: body.destinationId,
      transportMode: body.transportMode,
      departureTime: body.departureTime ? new Date(body.departureTime) : undefined,
      arrivalTime: body.arrivalTime ? new Date(body.arrivalTime) : undefined,
      notes: body.notes,
      order: body.order,
    });
  }
}
