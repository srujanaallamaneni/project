import { Controller, Get,Post } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('skill-popularity')
  async getSkillPopularity() {
    return await this.reportsService.getSkillPopularity();
  }

}
