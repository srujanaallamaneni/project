import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import {ApiTags,ApiOperation,ApiResponse} from '@nestjs/swagger'
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({summary:'User Login'})
  @ApiResponse({status:201,description:'user logged in successfully'})
  @ApiResponse({status:401,description:'Invalid credentials.'})
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
