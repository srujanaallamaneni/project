import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Employee } from '../employees/employee.schema';
import { Skill } from '../skills/skills.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Skill.name) private readonly skillModel: Model<Skill>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
  ) {}

//  alternative 1
//   async getSkillPopularity(): Promise<any[]> {
//   const start=Date.now();
    
//   const result=  await this.skillModel.aggregate([
//     {
//       $lookup: {
//         from: "employees",
//         let: { skillId: "$_id" },
//         pipeline: [
//           { 
//             $match: { 
//               $expr: { $in: ["$$skillId", "$skills"] }
//             }
//           }
//         ],
//         as: "employees"
//       }
//     },

//     {
//       $project: {
//         name: 1,
//         totalEmployees: { $size: "$employees" }
//       }
//     },

//     { $sort: { totalEmployees: -1, name: 1 } }
//   ]);

//   const end=Date.now();
//   console.log("excecution time:",end-start,"ms");
//   return result;
// }

// alternative 2
async getSkillPopularity(): Promise<any[]> {
  const start = Date.now();

  const result = await this.skillModel.aggregate([
    {
      $lookup: {
        from: "employees",
        let: { skillId: "$_id" },
        pipeline: [
          { $match: { $expr: { $in: ["$$skillId", "$skills"] } } },
          { $count: "count" }
        ],
        as: "stats"
      }
    },
    {
      $project: {
        name: 1,
        totalEmployees: {
          $ifNull: [{ $arrayElemAt: ["$stats.count", 0] }, 0]
        }
      }
    },
    { $sort: { totalEmployees: -1, name: 1 } }
  ]);

  const end = Date.now();
  console.log("Execution time:", end - start, "ms");

  return result;
}


//alternative 3
// async getSkillPopularity(): Promise<any[]> {
//   const start=Date.now();
//   const result= await this.employeeModel.aggregate([

//     // Flatten all employee skills into ONE array
//     {
//       $group: {
//         _id: null,
//         skills: { $push: "$skills" }
//       }
//     },

//     //Merge nested arrays → single big array of skillIds
//     {
//       $project: {
//         skills: {
//           $reduce: {
//             input: "$skills",
//             initialValue: [],
//             in: { $concatArrays: ["$$value", "$$this"] }
//           }
//         }
//       }
//     },

//     // Convert to { skillId, count } format
//     { $unwind: "$skills" },

//     {
//       $group: {
//         _id: "$skills",
//         totalEmployees: { $sum: 1 }
//       }
//     },

//     //Lookup skill name
//     {
//       $lookup: {
//         from: "skills",
//         localField: "_id",
//         foreignField: "_id",
//         as: "skill"
//       }
//     },

//     { $unwind: "$skill" },

//     
//     {
//       $project: {
//         _id: 1,
//         name: "$skill.name",
//         totalEmployees: 1
//       }
//     },

//     { $sort: { totalEmployees: -1 } }
//   ]);
//    const end=Date.now();
//    console.log("execution time:",end-start,"ms");
//    return result;
// }



}
