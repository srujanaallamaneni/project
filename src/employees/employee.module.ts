import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
// import { DatabaseModule } from '../database/databasemodule';
import {SkillsModule} from '../skills/skills.module';

import {MongooseModule} from '@nestjs/mongoose';
import {Employee,EmployeeSchema} from './employee.schema';
import { AnalyticsModule }  from '../analytics/analytics.module';
import { Skill, SkillSchema } from '../skills/skills.schema';

@Module({
  imports: [SkillsModule,
    MongooseModule.forFeature([
      {name:Employee.name,schema:EmployeeSchema},
      {name:Skill.name,schema:SkillSchema}
    ])
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService,
    MongooseModule],
})
export class EmployeeModule {}
