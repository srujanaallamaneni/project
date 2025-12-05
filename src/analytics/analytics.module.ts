import { Module, forwardRef } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { EmployeeModule } from '../employees/employee.module';
import {MongooseModule} from '@nestjs/mongoose';
import {Employee,EmployeeSchema} from '../employees/employee.schema';

@Module({
  imports: [
    forwardRef(() => EmployeeModule),
    MongooseModule.forFeature ([
      {name:Employee.name,schema:EmployeeSchema}
    ])
  ],

  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
