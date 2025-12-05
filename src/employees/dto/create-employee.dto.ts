import { IsString, IsEmail, IsArray, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP001', description: 'Unique employee number' })
  @IsString()
  empNumber: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the employee' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Employee email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Software Engineer', description: 'Position of the employee' })
  @IsString()
  position: string;

  @ApiProperty({ example: '2025-01-01', description: 'Hire date in ISO string format' })
  @IsString()
  hireDate: string;

  @ApiPropertyOptional({ example: ['JavaScript', 'NestJS'], description: 'Skills of the employee' })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiProperty({ example: 'employee', description: 'Role of the employee', enum: ['admin', 'employee'] })
  @IsString()
  @IsIn(['admin', 'employee'])
  role: string;

  @ApiProperty({ example: 'securePassword123', description: 'Password for login' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 85, description: 'Engagement score of the employee' })
  @IsOptional()
  @IsNumber()
  engagementScore?: number;
}
