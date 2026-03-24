import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // Public — returns overview stats for the demo account
  @Get('demo')
  async getDemoOverview() {
    return await this.statsService.getDemoOverview();
  }

  // Public — returns all stats for the demo account (used by /recap-demo)
  @Get('demo/full')
  async getDemoFull() {
    return await this.statsService.getDemoFull();
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  async getOverview(@Request() req) {
    return await this.statsService.getOverview(req.user.userId);
  }

  @Get('by-transport')
  @UseGuards(JwtAuthGuard)
  async getByTransport(@Request() req) {
    return await this.statsService.getByTransport(req.user.userId);
  }

  @Get('countries')
  @UseGuards(JwtAuthGuard)
  async getCountries(@Request() req) {
    return await this.statsService.getCountries(req.user.userId);
  }

  @Get('by-year')
  @UseGuards(JwtAuthGuard)
  async getByYear(@Request() req) {
    return await this.statsService.getByYear(req.user.userId);
  }

  @Get('repeated-routes')
  @UseGuards(JwtAuthGuard)
  async getRepeatedRoutes(@Request() req) {
    return await this.statsService.getRepeatedRoutes(req.user.userId);
  }

  @Get('carbon-breakdown')
  @UseGuards(JwtAuthGuard)
  async getCarbonBreakdown(@Request() req) {
    return await this.statsService.getCarbonBreakdown(req.user.userId);
  }
}
