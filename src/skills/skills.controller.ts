import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { SkillsService } from '../skills/skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Roles } from '../auth/roles.decorator';
import {ApiTags,ApiOperation,ApiResponse,ApiQuery,ApiBearerAuth, ApiParam} from '@nestjs/swagger';


@ApiTags('Skills')
@Controller('skills')
@Roles('admin')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({summary:'Get all skills'})
  @ApiResponse({status:200,description:'List of all skills returned successfully'})
  async getAll() {
    return await this.skillsService.getAll();
  }
  @Get('unassigned') //aggregation eg
  @ApiOperation({summary:'Get unassigned skills'})
  @ApiResponse({status:200,description:'List of unassigned skills returned successfully'})
  async getUnassignedSkills() {
    return await this.skillsService.getUnassignedSkills();
  }
  @Get('total') //aggregation eg
  @ApiOperation({summary:'Get total number of skills'})
  @ApiResponse({status:200,description:'Total number of skills returned successfully'})
async getTotalSkills() {
  return await this.skillsService.getTotalSkills();
}

@Get('sorted') //aggregation eg
@ApiOperation({summary:'Get skills sorted by name'})
@ApiResponse({status:200,description:'Skills sorted by name returned successfully'})  
async getSkillsSorted() {
  return await this.skillsService.getSkillsSorted();
}


   @Get('paginate')
    @ApiOperation({summary:'Paginate skills'})
    @ApiQuery({name:'page',required:false,example:1,description:'Page number'})
    @ApiQuery({name:'limit',required:false,example:10,description:'Number of items per page'})
    @ApiQuery({name:'search',required:false,example:'JavaScript',description:'Search term for skill name'})
    @ApiQuery({name:'sortBy',required:false,example:'name',description:'Field to sort by'})
    @ApiQuery({name:'sortOrder',required:false,example:'asc',description:'Sort order: asc or desc'})
    @ApiResponse({status:200,description:'Paginated skills returned successfully'})

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
  @ApiOperation({summary:'Get skill by ID'})
  @ApiParam({name:'id',description:'Skill ID'})
  @ApiResponse({status:200,description:'Skill details returned successfully'})
  async getById(@Param('id') id: string) {
    return await this.skillsService.getById(id);
  }
 

  @Post()
  @ApiOperation({summary:'Create a new skill'})
  @ApiResponse({status:201,description:'Skill created successfully'}) 
  async create(@Body() body: CreateSkillDto) {
    return await this.skillsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({summary:'Update a skill' })
  @ApiResponse({status:200,description:'Skill updated successfully'})

  async update(@Param('id') id: string, @Body() body: UpdateSkillDto) {
    return await this.skillsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({summary:'Delete a skill'})
  @ApiResponse({status:200,description:'Skill deleted successfully'})

  async delete(@Param('id') id: string) {
    return await this.skillsService.delete(id);
  }
}
