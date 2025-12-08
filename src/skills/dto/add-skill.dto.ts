import {IsString,IsNumber} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
export class AddSkillDto{
    @ApiProperty({example:'skillId123',description:'ID of the skill to be added'})
    @IsString()
    skillId:string;

    @ApiProperty({example:75,description:'Proficiency level in the skill (0-100)'})
    @IsNumber()
    proficiency:number
}