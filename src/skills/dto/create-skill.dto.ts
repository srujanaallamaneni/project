import { IsString } from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({example:'JavaScript',description:'Name of the skill'})
  @IsString()
  name: string;

  @ApiProperty({example:'A programming language',description:'Description of the skill'})
  @IsString()
  description: string;
}
