import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {ApiTags,ApiOperation,ApiResponse,ApiParam,ApiBearerAuth} from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('employee/:id/score')
  @ApiOperation({summary:'Get engagement score for an employee',description:'Calculates and retrieves the engagement score for a specific employee based on their activities and skill usage.'})
  @ApiParam({name:'id',description:'Employee ID'})
  @ApiResponse({status:200,description:'Engagement score retrieved successfully',schema:{example:{employeeId:'9ujnmm9709uoijk3',engagementScore:23}}})
  async getEmployeeScore(@Param('id') employeeId: string) {
    const score = await this.analyticsService.calculateEngagementScore(employeeId);

    return {
      employeeId,
      engagementScore: score,
    };
  }
}
