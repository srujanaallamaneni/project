import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService{
  constructor(private configService:ConfigService){}
  getJwtSecret():string{
    return this.configService.get<string>('JWT_SECRET')!;
  }
}
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
