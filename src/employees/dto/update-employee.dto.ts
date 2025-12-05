import { IsString, IsEmail, IsArray, IsOptional, IsNumber, IsIn } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  empNumber?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  hireDate?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'employee'])
  role?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  engagementScore?: number;
}
