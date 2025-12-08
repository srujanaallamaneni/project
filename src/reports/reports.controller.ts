import { Controller, Get,Post } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {ApiTags,ApiOperation,ApiResponse,ApiBearerAuth} from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('skill-popularity')
  @ApiOperation({summary:'Get skill popularity report',description:'Generates a report showing the popularity of each skill based on the number of employees possessing that skill.'})
  @ApiResponse({status:200,description:'Skill popularity returned successfully'})
  async getSkillPopularity() {
    return await this.reportsService.getSkillPopularity();
  }

}
