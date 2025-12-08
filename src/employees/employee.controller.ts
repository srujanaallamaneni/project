import { Controller, Get, Post, Patch, Delete, Param, Body, Req, ForbiddenException, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AddSkillDto } from '../skills/dto/add-skill.dto';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
@ApiTags('Employees')
@ApiBearerAuth()
@Roles('admin')
@Controller('employees')

export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @ApiOperation({summary:'Get all employees'})
  @ApiResponse({status:200,description:'List of all employees returned successfully'})
  async getAll() {
    return await this.employeeService.getAll();
  }
   @Get('with-skills') //aggregation eg
   @ApiOperation({summary:'Get employees with their skills'})
   @ApiResponse({status:200,description:'List of employees with their skills returned successfully'}) 
  
  getEmployeesWithSkills() {
    return this.employeeService.getEmployeesWithSkills();
  }


  @Get('top-engaged') //aggregation eg
  @ApiOperation({summary:'Get top engaged employees'})
  @ApiResponse({status:200,description:'List of top engaged employees returned successfully'})
  
  getTopEngagedEmployees() {
    return this.employeeService.topEngagedEmployees();
  }

  @Get('employee-with-skills') //populate eg
  @ApiOperation({summary:'Get employees along with their skills'})
  @ApiResponse({status:200,description:'List of employees along with their skills returned successfully'})
  async getEmployeeWithSkills(){
    return await this.employeeService.getEmployeeWithSkills();
  }
  @Get('skills/engagement-report')
  @ApiOperation({summary:'Get skill engagement report'})
  @ApiResponse({status:200,description:'Skill engagement report generated successfully'})
  async getSkillEngagementReport() {
    return await this.employeeService.getSkillEngagementReport();
  }

  //ranking by difficulty
  @Get('difficulty')
  @ApiOperation({summary:'Get employees ranked by skill difficulty'})
  @ApiResponse({status:200,description:'Employees ranked by skill difficulty returned successfully'})
  async getEmployeeBySkillDifficulty(){
    return await this.employeeService.getEmployeeBySkillDifficulty();
  }

  @Get('paginate') //pagination eg
  @ApiOperation({summary:'Get paginated employees'})
  @ApiQuery({name:'page',required:false,example:1,description:'page number'})
  @ApiQuery({name:'limit',required:false,example:10,description:'number of items per page'})
  @ApiQuery({name:'search',required:false,example:'John'})
  @ApiResponse({status:200,description:'paginated employees returned successfully'})
  async paginate(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    return await this.employeeService.paginate(Number(page), Number(limit), search);
  }

  @Get(':id')
  @ApiOperation({summary:'Get employee by ID'})
  @ApiParam({name:'id',description:'Employee ID'})
  @ApiResponse({status:200,description:'Employee data returned successfully'})
  @ApiResponse({status:403,description:'you can only access your own data'})
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
  @ApiOperation({summary:'Get employee by Employee Number'})
  @ApiParam({name:'empNumber',description:'Employee Number'})
  @ApiResponse({status:200,description:'Employee data returned successfully'})
  
  async getByEmpNumber(@Param('empNumber') empNumber: string) {
    return await this.employeeService.getByEmpNumber(empNumber);
  }
  
   @Get('count/by-position') //aggregation eg
   @ApiOperation({summary:'Get employees count by position'})
   @ApiResponse({status:200,description:'Employees count by position returned successfully'})
  
  countByPosition() {
    return this.employeeService.countByPosition();
  }


  // @Post('bulk')
  //@ApiOperation({summary:'Create multiple employees in bulk'})
  //@ApiResponse({status:201,description:'Employees created successfully in bulk})
  // async createBulk(@Body() body:CreateEmployeeDto[]){
  //   return await this.employeeService.createBulk(body)
  // }

  @Post('dummy-bulk/:count')
  @ApiOperation({summary:'Generate dummy employees in bulk'})
  @ApiParam({name:'count',description:'Number of dummy employees to generate (max:500)'})
  @ApiResponse({status:201,description:'Dummy employees generated successfully in bulk'})
async dummyBulk(@Param('count') count: number) {
  const safeCount = Math.max(1, Math.min(Number(count), 500)); // limit to 500 safety
  return this.employeeService.generateDummyEmployeesBulk(safeCount);
}


  
  
  


  @Post()
  @ApiOperation({summary:'Create a new employee'})
  @ApiResponse({status:201,description:'Employee created successfully'})
  async create(@Body() employees: CreateEmployeeDto) {
    return await this.employeeService.create(employees);
  }

  @Post(':id/skills')
  @ApiOperation({summary:'Add skill to an employee'})
  @ApiParam({name:'id',description:'Employee ID'})
  @ApiResponse({status:201,description:'Skill added to employee successfully'})
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
  @ApiOperation({summary:'update employee details'})
  @ApiParam({name:'id'})
  @ApiResponse({status:200,description:'Employee details updated successfully'})
  async update(@Param('id') id: string, @Body() body: UpdateEmployeeDto) {
    return await this.employeeService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({summary:'delete employee'})
  @ApiParam({name:'id'})
  @ApiResponse({status:200,description:'Employee deleted successfully'})
  async delete(@Param('id') id: string) {
    return await this.employeeService.delete(id);
  }
}
