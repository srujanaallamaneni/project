import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EmployeeService } from '../employees/employee.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private employeeService: EmployeeService,
    private jwtService: JwtService,
    private configService: ConfigService, 
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    // 1) Find employee by email
    const employee = await this.employeeService.findByEmail(dto.email);

    if (!employee) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2) Ensure only ADMIN can log in
    if (employee.role !== 'admin') {
      throw new UnauthorizedException('Only admin users can log in');
    }

    // 3) Compare password (bcrypt)
    const isMatch = await bcrypt.compare(dto.password, employee.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4) Load JWT Secret (for debugging)
    const secret = this.configService.get<string>('JWT_SECRET');
    console.log('Loaded JWT secret:', secret); 

    // 5) Generate JWT
    const token = await this.jwtService.signAsync(
      {
        id: employee.id,
        email: employee.email,
        role: employee.role,
      },
      {
        secret,         
      },
    );

    return { access_token: token };
  }
}
