import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}

  async searchPlaces(search: string) {
    if (!search || search.trim().length < 2) return [];

    return this.prisma.place.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { countryName: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
        ],
      },
      take: 8,
      orderBy: { name: 'asc' },
    });
  }

  // Find existing place by name + countryCode, or create it.
  // We match on name + countryCode rather than coordinates to avoid
  // floating-point mismatches from the geocoding API.
  async findOrCreate(data: {
    name: string;
    countryCode: string;
    countryName: string;
    latitude: number;
    longitude: number;
    displayName?: string;
  }) {
    const existing = await this.prisma.place.findFirst({
      where: { name: data.name, countryCode: data.countryCode },
    });
    if (existing) return existing;

    try {
      return await this.prisma.place.create({ data });
    } catch {
      // Race condition: another request created it between our check and create
      return await this.prisma.place.findFirst({
        where: { name: data.name, countryCode: data.countryCode },
      });
    }
  }
}
