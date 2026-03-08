import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateDistance, calculateCarbon } from '../utils/calculations';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // GET ALL TRIPS FOR A USER
  // ==========================================
  async getAllTrips(userId: string) {
    // Find all trips belonging to this user
    // Include segments with their origin and destination places
    return await this.prisma.trip.findMany({
      where: { userId },
      include: {
        segments: {
          include: {
            origin: true,
            destination: true,
          },
          orderBy: {
            order: 'asc',  // Sort segments by order field
          },
        },
      },
      orderBy: {
        startDate: 'desc',  // Most recent trips first
      },
    });
  }

  // ==========================================
  // GET SINGLE TRIP BY ID
  // ==========================================
  async getTripById(id: string, userId: string) {
    // Find the trip with this ID
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        segments: {
          include: {
            origin: true,
            destination: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    // If trip doesn't exist, throw 404 error
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    // If trip belongs to another user, throw 403 error
    if (trip.userId !== userId) {
      throw new ForbiddenException('You do not have access to this trip');
    }

    return trip;
  }

  // ==========================================
  // GET TRIPS BY USER ID
  // ==========================================
  async getTripsByUser(userId: string) {
    return await this.prisma.trip.findMany({
      where: { userId },
      include: {
        segments: {
          include: {
            origin: true,
            destination: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  // ==========================================
  // CREATE NEW TRIP
  // ==========================================
  async createTrip(userId: string, data: {
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    isPublic?: boolean;
  }) {
    // Create trip without segments first
    return await this.prisma.trip.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        isPublic: data.isPublic || false,
      },
    });
  }

  // ==========================================
  // UPDATE TRIP
  // ==========================================
  async updateTrip(tripId: string, userId: string, data: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    isPublic?: boolean;
  }) {
    // First check if trip exists and belongs to user
    const trip = await this.getTripById(tripId, userId);

    // Update the trip
    return await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        isPublic: data.isPublic,
      },
    });
  }

  // ==========================================
  // DELETE TRIP
  // ==========================================
  async deleteTrip(tripId: string, userId: string) {
    // First check if trip exists and belongs to user
    await this.getTripById(tripId, userId);

    // Delete the trip (CASCADE will delete segments automatically)
    await this.prisma.trip.delete({
      where: { id: tripId },
    });

    return { message: 'Trip deleted successfully' };
  }

  // ==========================================
  // ADD SEGMENT TO TRIP (WITH AUTO-CALCULATION!)
  // ==========================================
  async addSegment(tripId: string, userId: string, data: {
    originId: string;
    destinationId: string;
    transportMode: string;
    departureTime?: Date;
    arrivalTime?: Date;
    notes?: string;
    order?: number;
  }) {
    // 1. Verify trip exists and belongs to user
    await this.getTripById(tripId, userId);

    // 2. Fetch origin place to get coordinates
    const origin = await this.prisma.place.findUnique({
      where: { id: data.originId },
    });

    if (!origin) {
      throw new NotFoundException(`Origin place with ID ${data.originId} not found`);
    }

    // 3. Fetch destination place to get coordinates
    const destination = await this.prisma.place.findUnique({
      where: { id: data.destinationId },
    });

    if (!destination) {
      throw new NotFoundException(`Destination place with ID ${data.destinationId} not found`);
    }

    // 4. AUTO-CALCULATE distance using Haversine formula
    const distance = calculateDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    );

    // 5. AUTO-CALCULATE carbon footprint based on distance and transport mode
    const carbonFootprint = calculateCarbon(distance, data.transportMode);

    // 6. Determine order (if not provided, add to end)
    let order = data.order;
    if (order === undefined) {
      // Find the highest order number for this trip and add 1
      const lastSegment = await this.prisma.segment.findFirst({
        where: { tripId },
        orderBy: { order: 'desc' },
      });
      order = lastSegment ? lastSegment.order + 1 : 0;
    }

    // 7. Create segment with calculated values
    return await this.prisma.segment.create({
      data: {
        tripId,
        originId: data.originId,
        destinationId: data.destinationId,
        transportMode: data.transportMode,
        distance,              // ← AUTO-CALCULATED!
        carbonFootprint,       // ← AUTO-CALCULATED!
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
        notes: data.notes,
        order,
      },
      include: {
        origin: true,
        destination: true,
      },
    });
  }

  // ==========================================
  // UPDATE SEGMENT (WITH AUTO-RECALCULATION!)
  // ==========================================
  async updateSegment(segmentId: string, userId: string, data: {
    originId?: string;
    destinationId?: string;
    transportMode?: string;
    departureTime?: Date;
    arrivalTime?: Date;
    notes?: string;
    order?: number;
  }) {
    // 1. Find the segment
    const segment = await this.prisma.segment.findUnique({
      where: { id: segmentId },
      include: {
        trip: true,  // Include trip to check ownership
      },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${segmentId} not found`);
    }

    // 2. Check if user owns the trip this segment belongs to
    if (segment.trip.userId !== userId) {
      throw new ForbiddenException('You do not have access to this segment');
    }

    // 3. If origin or destination changed, recalculate distance and carbon
    let distance = segment.distance;
    let carbonFootprint = segment.carbonFootprint;

    // Check if we need to recalculate
    const needsRecalculation = 
      data.originId || 
      data.destinationId || 
      data.transportMode;

    if (needsRecalculation) {
      // Get the origin (either new or existing)
      const originId = data.originId || segment.originId;
      const origin = await this.prisma.place.findUnique({
        where: { id: originId },
      });

      // Get the destination (either new or existing)
      const destinationId = data.destinationId || segment.destinationId;
      const destination = await this.prisma.place.findUnique({
        where: { id: destinationId },
      });

      if (!origin || !destination) {
        throw new NotFoundException('Origin or destination place not found');
      }

      // Recalculate distance
      distance = calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );

      // Recalculate carbon (use new transport mode if provided)
      const transportMode = data.transportMode || segment.transportMode;
      carbonFootprint = calculateCarbon(distance, transportMode);
    }

    // 4. Update segment with potentially recalculated values
    return await this.prisma.segment.update({
      where: { id: segmentId },
      data: {
        originId: data.originId,
        destinationId: data.destinationId,
        transportMode: data.transportMode,
        distance,              // ← RECALCULATED if origin/dest/mode changed
        carbonFootprint,       // ← RECALCULATED if origin/dest/mode changed
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
        notes: data.notes,
        order: data.order,
      },
      include: {
        origin: true,
        destination: true,
      },
    });
  }

  // ==========================================
  // DELETE SEGMENT
  // ==========================================
  async deleteSegment(segmentId: string, userId: string) {
    // 1. Find the segment
    const segment = await this.prisma.segment.findUnique({
      where: { id: segmentId },
      include: {
        trip: true,
      },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${segmentId} not found`);
    }

    // 2. Check ownership
    if (segment.trip.userId !== userId) {
      throw new ForbiddenException('You do not have access to this segment');
    }

    // 3. Delete the segment
    await this.prisma.segment.delete({
      where: { id: segmentId },
    });

    return { message: 'Segment deleted successfully' };
  }

  // ==========================================
  // RECALCULATE ALL SEGMENTS (UTILITY FUNCTION)
  // ==========================================
  // This is useful if you want to recalculate all existing segments
  // For example, if you improve your carbon calculation formula
  async recalculateAllSegments(userId: string) {
    // Get all trips for this user
    const trips = await this.prisma.trip.findMany({
      where: { userId },
      include: {
        segments: {
          include: {
            origin: true,
            destination: true,
          },
        },
      },
    });

    let updatedCount = 0;

    // Loop through each trip and each segment
    for (const trip of trips) {
      for (const segment of trip.segments) {
        // Recalculate distance
        const distance = calculateDistance(
          segment.origin.latitude,
          segment.origin.longitude,
          segment.destination.latitude,
          segment.destination.longitude
        );

        // Recalculate carbon
        const carbonFootprint = calculateCarbon(distance, segment.transportMode);

        // Update segment
        await this.prisma.segment.update({
          where: { id: segment.id },
          data: {
            distance,
            carbonFootprint,
          },
        });

        updatedCount++;
      }
    }

    return {
      message: `Recalculated ${updatedCount} segments`,
      segmentsUpdated: updatedCount,
    };
  }
}