import { IsString, IsEmail, IsArray, IsOptional, IsNumber, IsIn } from 'class-validator';
import {ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({example:'EMP001',description:'Unique Employee Number'})
  @IsOptional()
  @IsString()
  empNumber?: string;

  @ApiPropertyOptional({example:'John',description:'Updated name of the employee'})
  @IsOptional()
  @IsString()
  name?: string;
  
  @ApiPropertyOptional({description:'Updated email of the employee'})
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @ApiPropertyOptional({example:'Senior Developer',description:'Updated position of the employee'})
  @IsOptional()
  @IsString()
  position?: string;


  @ApiPropertyOptional({example:'2025-01-01',description:'Updated hire date in ISO string format',type:String})
  @IsOptional()
  @IsString()
  hireDate?: string;


  @ApiPropertyOptional({example: ['skillId1', 'skillId2'],description: 'Array of skill IDs'})
  @IsOptional()
  @IsArray()
  skills?: string[];


  @ApiPropertyOptional({ example: 'employee', enum: ['admin', 'employee'] })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'employee'])
  role?: string;


  @ApiPropertyOptional({ example: 'newPassword123' })
  @IsOptional()
  @IsString()
  password?: string;


  @ApiPropertyOptional({ example: 92 })
  @IsOptional()
  @IsNumber()
  engagementScore?: number;
}
