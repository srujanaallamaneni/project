import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from '../employees/employee.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
  ) {}

  async calculateEngagementScore(employeeId: string): Promise<number> {
    // 1. find emp by id
    const employee = await this.employeeModel.findById(employeeId);

    // 2. If not found, throw exception
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // 3. Calculate number of skills
    const numSkills = employee.skills.length;

    //4. calculate years since hire
    const currentYear = new Date().getFullYear();
    const hireYear = new Date(employee.hireDate).getFullYear();
    const yearsSinceHire = currentYear - hireYear;

    // 5. calculate engagement score
    const engagementScore = numSkills * 10 + yearsSinceHire * 5;

    // 6. return score
    return engagementScore;
  }
}
  //aggregation 
//   import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import { Employee } from '../employees/employee.schema';
// import { EmployeeService } from '../employees/employee.service';

// @Injectable()
// export class AnalyticsService {
//   constructor(
//     // @Inject(forwardRef(() => EmployeeService))
//     // private readonly employeeService: EmployeeService,

// //     @InjectModel(Employee.name)
// //     private readonly employeeModel: Model<Employee>,
// //   ) {}

// //   async calculateEngagementScore(employeeId: string): Promise<number> {
// //     const result = await this.employeeModel.aggregate([
// //       { $match: { _id: new Types.ObjectId(employeeId) } },

// //       {
// //         $addFields: {
// //           numSkills: { $size: '$skills' },
// //           yearsSinceHire: {
// //             $subtract: [
// //               { $year: new Date() },
// //               { $year: { $toDate: '$hireDate' } },
// //             ],
// //           },
// //         },
// //       },

// //       {
// //         $addFields: {
// //           engagementScore: {
// //             $add: [
// //               { $multiply: ['$numSkills', 10] },
// //               { $multiply: ['$yearsSinceHire', 5] },
// //             ],
// //           },
// //         },
// //       },

// //       {
// //         $project: {
// //           engagementScore: 1,
// //           _id: 0,
// //         },
// //       },
// //     ]);

// //     if (!result.length) throw new NotFoundException('Employee not found');

// //     return result[0].engagementScore;
// //   }
// // }
  
