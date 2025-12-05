import { Controller, Get, Post, Patch, Delete, Param, Body, Req, ForbiddenException, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AddSkillDto } from '../skills/dto/add-skill.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('employees')
@Roles('admin')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  async getAll() {
    return await this.employeeService.getAll();
  }
   @Get('with-skills') //aggregation eg
  
  getEmployeesWithSkills() {
    return this.employeeService.getEmployeesWithSkills();
  }
  @Get('top-engaged') //aggregation eg
  
  getTopEngagedEmployees() {
    return this.employeeService.topEngagedEmployees();
  }

  @Get('employee-with-skills') //populate eg
  async getEmployeeWithSkills(){
    return await this.employeeService.getEmployeeWithSkills();
  }
  @Get('skills/engagement-report')
  async getSkillEngagementReport() {
    return await this.employeeService.getSkillEngagementReport();
  }

  //ranking by difficulty
  @Get('difficulty')
  async getEmployeeBySkillDifficulty(){
    return await this.employeeService.getEmployeeBySKillDifficulty();
  }

  @Get('paginate') //pagination eg
  async paginate(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    return await this.employeeService.paginate(Number(page), Number(limit), search);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any) {
    const user = req.user; // From JwtStrategy

    if (user.role === 'admin') {
      // Admin can get any employee
      return await this.employeeService.getById(id);
    }

    // Non-admin can only access own data
    if (user.id !== id) {
      throw new ForbiddenException('You can only access your own data');
    }

    return await this.employeeService.getById(id);
  }

  @Get('number/:empNumber')
  async getByEmpNumber(@Param('empNumber') empNumber: string) {
    return await this.employeeService.getByEmpNumber(empNumber);
  }
  
   @Get('count/by-position') //aggregation eg
  
  countByPosition() {
    return this.employeeService.countByPosition();
  }


  // @Post('bulk')
  // async createBulk(@Body() body:CreateEmployeeDto[]){
  //   return await this.employeeService.createBulk(body)
  // }

  @Post('dummy-bulk/:count')
async dummyBulk(@Param('count') count: number) {
  const safeCount = Math.max(1, Math.min(Number(count), 500)); // limit to 500 safety
  return this.employeeService.generateDummyEmployeesBulk(safeCount);
}


  
  
  


  @Post()
  async create(@Body() employees: CreateEmployeeDto) {
    return await this.employeeService.create(employees);
  }

  @Post(':id/skills')
async addSkill(
  @Param('id') id: string,
  @Body() addSkillDto: AddSkillDto
) {
  return await this.employeeService.addSkillToEmployee(
    id,
    addSkillDto.skillId,
    addSkillDto.proficiency
  );
}


  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateEmployeeDto) {
    return await this.employeeService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.employeeService.delete(id);
  }
}
