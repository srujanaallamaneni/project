import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Employee,EmployeeSchema} from '../employees/employee.schema';
import {Skill,SkillSchema} from '../skills/skills.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name:Employee.name,schema:EmployeeSchema},
      {name:Skill.name,schema:SkillSchema}
    ])
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
