import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('employee/:id/score')
  async getEmployeeScore(@Param('id') employeeId: string) {
    const score = await this.analyticsService.calculateEngagementScore(employeeId);

    return {
      employeeId,
      engagementScore: score,
    };
  }
}
