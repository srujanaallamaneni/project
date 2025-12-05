import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { SkillsService } from '../skills/skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('skills')
@Roles('admin')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async getAll() {
    return await this.skillsService.getAll();
  }
  @Get('unassigned') //aggregation eg
  async getUnassignedSkills() {
    return await this.skillsService.getUnassignedSkills();
  }
  @Get('total') //aggregation eg
async getTotalSkills() {
  return await this.skillsService.getTotalSkills();
}

@Get('sorted') //aggregation eg
async getSkillsSorted() {
  return await this.skillsService.getSkillsSorted();
}


   @Get('paginate')
async paginate(
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10',
  @Query('search') search?: string,
  @Query('sortBy') sortBy?: string,
  @Query('sortOrder') sortOrder?: 'asc' | 'desc' | 1 | -1,
) {
  return await this.skillsService.paginate(Number(page), Number(limit), search,sortBy,sortOrder);
}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.skillsService.getById(id);
  }
 

  @Post()
  async create(@Body() body: CreateSkillDto) {
    return await this.skillsService.create(body);
  }

  @Patch(':id')

  async update(@Param('id') id: string, @Body() body: UpdateSkillDto) {
    return await this.skillsService.update(id, body);
  }

  @Delete(':id')

  async delete(@Param('id') id: string) {
    return await this.skillsService.delete(id);
  }
}
