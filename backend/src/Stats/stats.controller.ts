import { Controller, Get, Request, UseGuards } from '@nestjs/common';

// Import our service that contains the business logic
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller with JWT authentication
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  async getOverview(@Request() req) {
    return await this.statsService.getOverview(req.user.userId);
  }

  @Get('by-transport')
  async getByTransport(@Request() req) {
    return await this.statsService.getByTransport(req.user.userId);
  }

  @Get('countries')
  async getCountries(@Request() req) {
    return await this.statsService.getCountries(req.user.userId);
  }

  @Get('by-year')
  async getByYear(@Request() req) {
    return await this.statsService.getByYear(req.user.userId);
  }

  @Get('repeated-routes')
  async getRepeatedRoutes(@Request() req) {
    return await this.statsService.getRepeatedRoutes(req.user.userId);
  }

  @Get('carbon-breakdown')
  async getCarbonBreakdown(@Request() req) {
    return await this.statsService.getCarbonBreakdown(req.user.userId);
  }
}