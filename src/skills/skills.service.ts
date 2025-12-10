import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; 
import { Model } from 'mongoose'; 
import { Skill, SkillSchema } from './skills.schema'; 

import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import {Types} from 'mongoose';


@Injectable()
export class SkillsService {
  
  constructor(
    @InjectModel(Skill.name)
    private skillModel: Model<Skill>,
  ) {}

  
  async getAll(): Promise<Skill[]> {
    
    return await this.skillModel.find();
  }

  async getById(id: string): Promise<Skill> {
    
    const skill = await this.skillModel.findById(id);
    if (!skill) {
      throw new NotFoundException(`Skill with ID "${id}" not found`);
    }
    return skill;
  }

  async create(body: CreateSkillDto): Promise<Skill> {
    //uniqueness check
    const existingSkill = await this.skillModel.findOne({ name: body.name });
    if (existingSkill) {
      throw new BadRequestException('Skill name must be unique');
    }

    //creating new one 
    const createdSkill = new this.skillModel(body);
    return await createdSkill.save();
  }

  async update(id: string, body: UpdateSkillDto): Promise<Skill> {
    
    // { new: true } option ensures the method returns the updated document
    const updatedSkill = await this.skillModel
      .findByIdAndUpdate(id, body, { new: true });

    if (!updatedSkill) {
      throw new NotFoundException(`Skill with ID "${id}" not found`);
    }
    return updatedSkill;
  }

  async delete(id: string): Promise<Skill> {
    
    const deletedSkill = await this.skillModel.findByIdAndDelete(id);

    if (!deletedSkill) {
      throw new NotFoundException(`Skill with ID "${id}" not found`);
    }
    return deletedSkill;
  }
  //aggregation 
 async getUnassignedSkills() {
  return this.skillModel.aggregate([
    {
      $lookup: {
        from: "employees",
        let: { skillId: "$_id" },
        pipeline: [
          { $unwind: "$skills" },
          {
            $match: {
              $expr: { $eq: ["$skills.skillId", "$$skillId"] }
            }
          },
          { $limit: 1 }
        ],
        as: "employees"
      }
    },
    { $match: { employees: { $size: 0 } } },
    { $project: { name: 1 } }
  ]);
}


  async getTotalSkills() {
  const result = await this.skillModel.aggregate([
    { $count: "totalSkills" }
  ]);

  return result[0]?.totalSkills ?? 0;
}

async getSkillsSorted() {
  return await this.skillModel.aggregate([
    { $sort: { name: 1 } }
  ]);
}


  async paginate(page = 1, limit = 10, search?: string, sortBy:string='name',sortOrder:'asc'| 'desc' | 1 | -1='asc') {
  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100); // clamp 1..100
  const skip = (pageNum - 1) * limitNum;

  const pipeline: any[] = []; // it's an array that stores all momgodb aggregation stages  // Optional search filter (case-insensitive substring match)
  if (search) {
    pipeline.push({
      $match: {
        name: { $regex: search, $options: 'i' },
      },
    });
  }
  const sortValue = sortOrder === 'asc' || sortOrder === 1 ? 1 : -1;

  
  const allowedSortFields = ['name','description','_id']; // Add what your schema supports
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';

  // Use $facet to get paged data and total count in one query
  pipeline.push({
    $facet: {
      data: [
        { $sort: { [safeSortBy]:sortValue } },
        { $skip: skip },
        { $limit: limitNum },
      ],
      totalCount: [{ $count: 'count' }],
    },
  });

  const aggResult = await this.skillModel.aggregate(pipeline);
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
    sortBy:safeSortBy,
    sortOrder:sortValue,
  };
}
}
