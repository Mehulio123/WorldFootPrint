import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { PlacesService } from './places.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async searchPlaces(@Query('search') search: string) {
    return this.placesService.searchPlaces(search ?? '');
  }

  @Post('findOrCreate')
  @UseGuards(JwtAuthGuard)
  async findOrCreate(
    @Body() body: {
      name: string;
      countryCode: string;
      countryName: string;
      latitude: number;
      longitude: number;
      displayName?: string;
    },
  ) {
    return this.placesService.findOrCreate(body);
  }
}
