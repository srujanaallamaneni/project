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
  return this.employeeModel.aggregate<any>([
    // Step 1: Unwind skills array
    

    
    {
      $lookup: {
        from: "skills",
        localField: "skills.skillId",
        foreignField: "_id",
        as: "skillDetails",
      },
    },

    // Step 3: Unwind skillDetails (always contains 1 matched skill)
    { $unwind: "$skillDetails" },

    // Step 4: Group by skill
    {
      $group: {
        _id: "$skillDetails._id",
        skillName: { $first: "$skillDetails.name" },

        employees: {
          $push: {
            _id: "$_id",
            name: "$name",
            engagementScore: "$engagementScore",
          },
        },

        avgEngagement: { $avg: "$engagementScore" },
      },
    },

    // Step 5: Sort employees within each skill
    {
      $addFields: {
        employees: {
          $sortArray: {
            input: "$employees",
            sortBy: { engagementScore: -1 },
          },
        },
      },
    },

    // Step 6: Sort skills by avg engagement
    { $sort: { avgEngagement: -1 } },

    // Cleanup
    {
      $project: {
        _id: 0,
        skillId: "$_id",
        skillName: 1,
        avgEngagement: 1,
        employees: 1,
      },
    },
  ]);
}


  //ranking by difficulty-task2
  async getEmployeeBySKillDifficulty(): Promise<any[]> {
    return this.employeeModel.aggregate([
      {
        $unwind: "$skills"
      },
      {
        $lookup:{
          from:"skills",
          localField:"skills.skillId",
          foreignField:"_id",
          as:"skillDetails"
        }
      },
      {
        $unwind: "$skillDetails"
      },
      
      {
        $group:{
          _id:"$skills.skillId",
          skillName:{$first:"$skillDetails.name"},
          avgProficiency:{$avg:"$skills.proficiency"},
          employees:{
            $push:{
              name:"$name",
              proficiency:"$skills.proficiency"
            }
          }
        }
      },
      {
        $addFields:{ //skiname,prof,diffi
          difficulty:{
            $subtract:[100,{$multiply:["$avgProficiency",5]}]
          }
          }
        },
      {
        $addFields: {
          topEmployees: {
            $slice: [
              {
                $sortArray: {
                  input: "$employees",
                  sortBy: { proficiency: -1
                   }
                }
              },
              5
            ]
          }
        }
      },
      {
        $sort:{
          difficulty:-1
        }
      },
      {
        $project:{
          _id:0,
          skillName:1,
          difficulty:1,
          topEmployees:1
        }
      }
    ]);
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

  const lastEmployee = await this.employeeModel.findOne().sort({ empNumber: -1 });
  let lastNumber = lastEmployee ? parseInt(lastEmployee.empNumber.replace('EMP', ''), 10) : 0;

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
    if (allSkills.length > 0) { // only if skills exist
      const numberOfSkills = faker.number.int({ min: 1, max: 3 });
      for (let j = 0; j < numberOfSkills; j++) {
        const randomSkill = faker.helpers.arrayElement(allSkills) as any;

        // Avoid duplicates
        if (!employeeSkills.find(s => s.skillId.equals(randomSkill._id))) {
          employeeSkills.push({
            skillId: randomSkill._id,
            proficiency: faker.number.int({ min: 1, max: 10 })
          });
        }
      }
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


