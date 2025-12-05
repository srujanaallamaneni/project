import {IsString,IsNumber} from 'class-validator';
export class AddSkillDto{
    @IsString()
    skillId:string;
    @IsNumber()
    proficiency:number
}