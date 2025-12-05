import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { EmployeeModule } from './employees/employee.module';
import { SkillsModule } from './skills/skills.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import {AnalyticsModule} from './analytics/analytics.module';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),

    EmployeeModule,
    SkillsModule,
    AuthModule,
    ReportsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
