import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
import {faker} from '@faker-js/faker';
import mongoose from 'mongoose';
import { SkillsService } from '../skills/skills.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.schema';
import * as bcrypt from 'bcrypt';


@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name)
    private employeeModel: Model<Employee>,
    private readonly skillsService: SkillsService,
  ) {}

  async getAll(): Promise<Employee[]> {
    return await this.employeeModel.find();
  }

  async getById(id: string): Promise<Employee> {
    const emp = await this.employeeModel.findById(id);
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async getByEmpNumber(empNumber: string): Promise<Employee> {
    const emp = await this.employeeModel.findOne({ empNumber });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }
  async getEmployeeWithSkills(): Promise<any[]> {
    return this.employeeModel
    .find()
    .populate({
      path:"skills",
      select:"name description _id"
    });
  }

  //new-Skill Sorted by Avg Engagement-taks1
  async getSkillEngagementReport(): Promise<any[]> {
  return this.employeeModel.aggregate([
    // Unwind once, then use facet to reuse the dataset
    { $unwind: "$skills" },

    {
      $facet: {
        
        skillStats: [
          {
            $lookup: {
              from: "skills",
              localField: "skills.skillId",
              foreignField: "_id",
              as: "skillDetails",
              pipeline: [{ $project: { name: 1 } }],
            }
          },
          { $unwind: "$skillDetails" },
          {
            $group: {
              _id: "$skills.skillId",
              skillName: { $first: "$skillDetails.name" },
              avgEngagement: { $avg: "$engagementScore" }
            }
          },
          { $sort: { avgEngagement: -1 } }
        ],

        
        employeeLists: [
          {
            $group: {
              _id: "$skills.skillId",
              employees: {
                $push: {
                  _id: "$_id",
                  name: "$name",
                  engagementScore: "$engagementScore"
                }
              }
            }
          },
          // Sort employees inside each skill
          {
            $project: {
              employees: {
                $slice: [
                  {
                    $sortArray: {
                      input: "$employees",
                      sortBy: { engagementScore: -1 }
                    }
                  },
                  1000 // take top N employees per skill
                ]
              }
            }
          }
        ]
      }
    },

    
    {
      $project: {
        data: {
          $map: {
            input: "$skillStats",
            as: "s",
            in: {
              skillId: "$$s._id",
              skillName: "$$s.skillName",
              avgEngagement: "$$s.avgEngagement",
              employees: {
                $let: {
                  vars: {
                    matchEmp: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$employeeLists",
                            cond: { $eq: ["$$this._id", "$$s._id"] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: "$$matchEmp.employees"
                }
              }
            }
          }
        }
      }
    },

    // Flatten result
    { $unwind: "$data" },
    { $replaceRoot: { newRoot: "$data" } }
  ], { allowDiskUse: true });
}


//engagementreports alternative
// async getSkillEngagementReport(): Promise<any[]> {
//   return this.employeeModel.aggregate([
//     // Step 1: Unwind employee skills
//     { $unwind: "$skills" },

//     // Step 2: Group employees by skillId
//     {
//       $group: {
//         _id: "$skills.skillId",
//         avgEngagement: { $avg: "$engagementScore" },
//         employees: {
//           $push: {
//             _id: "$_id",
//             name: "$name",
//             engagementScore: "$engagementScore"
//           }
//         }
//       }
//     },

//     // Step 3: Sort employees inside each skill by engagementScore desc
//     {
//       $addFields: {
//         employees: {
//           $sortArray: {
//             input: "$employees",
//             sortBy: { engagementScore: -1 }
//           }
//         }
//       }
//     },

//     // Step 4: Lookup skill name
//     {
//       $lookup: {
//         from: "skills",
//         localField: "_id",
//         foreignField: "_id",
//         as: "skillDetails",
//         pipeline: [
//           { $project: { name: 1 } }
//         ]
//       }
//     },

//     // Step 5: Unwind skillDetails
//     { $unwind: "$skillDetails" },

//     // Step 6: Final shape
//     {
//       $project: {
//         _id: 0,
//         skillName: "$skillDetails.name",
//         avgEngagement: 1,
//         employees: 1
//       }
//     },

//     // Step 7: Sort skills by avgEngagement desc
//     { $sort: { avgEngagement: -1 } }
//   ]);
// }





  //ranking by difficulty-task2
 async getEmployeeBySkillDifficulty() {
  return this.employeeModel.aggregate([
    // Stage 1: Unwind skills array
    { $unwind: "$skills" },

    // Stage 2: Efficient lookup for skill name
    {
      $lookup: {
        from: "skills",
        localField: "skills.skillId",
        foreignField: "_id",
        as: "skillDetails",
        pipeline: [{ $project: { name: 1 } }]
      }
    },
    { $unwind: "$skillDetails" },

    // Stage 3: Group by skill (no sort yet—faster for large data)
    {
      $group: {
        _id: "$skills.skillId",
        skillName: { $first: "$skillDetails.name" },
        totalProficiency: { $sum: "$skills.proficiency" },
        employeeCount: { $sum: 1 },
        employees: {
          $push: {
            name: "$name",
            proficiency: "$skills.proficiency"
          }
        }
      }
    },

    // Stage 4: Compute average proficiency
    {
      $addFields: {
        avgProficiency: {
          $divide: ["$totalProficiency", "$employeeCount"]
        }
      }
    },

    // Stage 5: Compute difficulty
    {
      $addFields: {
        difficulty: {
          $subtract: [100, { $multiply: ["$avgProficiency", 5] }]
        }
      }
    },

    // Stage 6: Sort employees array per skill (efficient, per-group sort)
    {
      $addFields: {
        employees: {
          $sortArray: {
            input: "$employees",
            sortBy: { proficiency: -1 }
          }
        }
      }
    },

    // Stage 7: Final sort by difficulty descending
    { $sort: { difficulty: -1 } },

    // Stage 8: Project final fields (clean up)
    {
      $project: {
        _id: 0,
        skillName: 1,
        difficulty: 1,
        employees: 1
      }
    }

  ], { allowDiskUse: true }); // Safety net for large groups
}




  async findByEmail(email: string): Promise<Employee | null> {
    return await this.employeeModel.findOne({ email });
  }

  

  // async createBulk(body:CreateEmployeeDto[]){
  //   return this.employeeModel.insertMany(body)
  // }

  async addSkillToEmployee(employeeId: string, skillId: string, proficiency: number): Promise<Employee> {
  const employee = await this.employeeModel.findById(employeeId);
  if (!employee) throw new NotFoundException('Employee not found');

  const skillObjectId = new Types.ObjectId(skillId);

  // find if skill already exists
  const existingSkill = employee.skills.find(s => s.skillId.equals(skillObjectId));

  if (existingSkill) {
    // update proficiency
    existingSkill.proficiency = proficiency;
  } else {
    employee.skills.push({
      skillId: skillObjectId,
      proficiency,
    });
  }

  return employee.save();
}


  async create(body: CreateEmployeeDto): Promise<Employee> {
    // Check unique fields
    const empNumberExists = await this.employeeModel.findOne({
      empNumber: body.empNumber,
    });
    if (empNumberExists)
      throw new BadRequestException('empNumber must be unique');

    const emailExists = await this.employeeModel.findOne({
      email: body.email,
    });
    if (emailExists)
      throw new BadRequestException('email must be unique');

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const employee = new this.employeeModel({
      ...body,
      password: hashedPassword,
      engagementScore: body.engagementScore ?? 0,
    });

    return employee.save();
  }

  async update(id: string, body: UpdateEmployeeDto): Promise<Employee> {
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const updated = await this.employeeModel.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!updated) throw new NotFoundException('Employee not found');

    return updated;
  }

  async delete(id: string): Promise<Employee> {
    const deleted = await this.employeeModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Employee not found');
    return deleted;
  }
  async getEmployeesWithSkills(): Promise<any[]> {
    return this.employeeModel.aggregate([
      {
        $lookup: {
          from: 'skills',
          localField: 'skills',
          foreignField: '_id',
          as: 'skillDetails',
        },
      },
    ]);
  }
  
//end
  async countByPosition(): Promise<any[]> {
    return this.employeeModel.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 },
        },
      },
    ]);
  }
  async topEngagedEmployees(limit = 5): Promise<Employee[]> {
    return this.employeeModel.aggregate([
      { $sort: { engagementScore: -1 } },
      { $limit: limit },
    ]);
  }
  async paginate(page = 1, limit = 10, search?: string): Promise<{ page: number; limit: number; total: number; totalPages: number; data: Employee[] }> {
  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100); // clamp 1..100
  const skip = (pageNum - 1) * limitNum;

  const pipeline: any[] = [];

  // Optional search filter (case-insensitive substring match)
  if (search) {
    pipeline.push({
      $match: {
        name: { $regex: search, $options: 'i' },
      },
    });
  }

  // Use $facet to get paged data and total count in one query
  pipeline.push({
    $facet: {
      data: [
        { $sort: { createdAt: -1 } }, // change field to sort by if needed
        { $skip: skip },
        { $limit: limitNum },
      ],
      totalCount: [{ $count: 'count' }],
    },
  });

  const aggResult = await this.employeeModel.aggregate(pipeline);
  const data = aggResult[0]?.data ?? [];
  const total = aggResult[0]?.totalCount?.[0]?.count ?? 0;

  // Compute totalPages digit-by-digit (safe)
  const totalPages = Math.ceil(total / limitNum);

  return {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    data,
  };
} 

async generateDummyEmployeesBulk(count: number): Promise<Employee[]> {
  const allSkills = await this.skillsService.getAll(); // fetch all skills from DB
  const employees: any[] = [];

  const lastEmployeeAgg = await this.employeeModel.aggregate([
  {
    $addFields: {
      empNumberNumeric: {
        $toInt: { $substr: ["$empNumber", 3, -1] } // convert EMP123 → 123
      }
    }
  },
  { $sort: { empNumberNumeric: -1 } },
  { $limit: 1 }
]);

const lastEmployee = lastEmployeeAgg[0];
let lastNumber = lastEmployee ? lastEmployee.empNumberNumeric : 0;


  for (let i = 0; i < count; i++) {
    const empNumber = 'EMP' + String(lastNumber + i + 1).padStart(3, '0');

    const name = faker.person.fullName();
    const email = faker.internet.email().toLowerCase().replace(/[^a-z0-9@.]/g, '');
    const position = faker.person.jobTitle();
    const hireDate = faker.date.past({ years: 5 }).toISOString().split('T')[0];

    const rawPassword = `Password@${Math.floor(Math.random() * 9000 + 1000)}`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const engagementScore = Math.floor(Math.random() * 101);

    const employeeSkills: { skillId: any; proficiency: number }[] = [];

for (const skill of allSkills) {
  employeeSkills.push({
    skillId: skill._id,
    proficiency: faker.number.int({ min: 1, max: 10 })
  });
}

    // ------------------------------------------------

    employees.push({
      empNumber,
      name,
      email,
      position,
      hireDate,
      password: hashedPassword,
      role: 'employee',
      engagementScore,
      skills: employeeSkills,
    });
  }

  return await this.employeeModel.insertMany(employees) as any[];
}







}


