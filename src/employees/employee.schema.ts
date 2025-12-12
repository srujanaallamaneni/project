import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose'

@Schema()
export class Employee extends Document {
  @Prop({ required: true, unique: true })
  empNumber: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  hireDate: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'employee' })
  role: string;

  @Prop({ default: 0 })
  engagementScore: number;

  @Prop({
    type: [
      {
        _id:false,
        skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        proficiency: { type: Number, min: 1, max: 10 },
      },
    ],
    default: [],
  })
  skills: {
    skillId: mongoose.Types.ObjectId;
    proficiency: number;
  }[];
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

EmployeeSchema.index({position:1});
EmployeeSchema.index({role:1});
EmployeeSchema.index({hireDate:1});
EmployeeSchema.index({engagementScore:-1});
EmployeeSchema.index({'skills.skillId':1});