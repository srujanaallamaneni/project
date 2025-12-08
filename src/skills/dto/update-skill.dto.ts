import { IsString, IsOptional } from 'class-validator';
import {ApiPropertyOptional} from '@nestjs/swagger';

export class UpdateSkillDto {
  @ApiPropertyOptional({example:'JavaScript',description:'Name of the skill'})
  @IsOptional()
  @IsString()
  name?: string;
  
  @ApiPropertyOptional({example:'A programming language',description:'Description of the skill'})
  @IsOptional()
  @IsString()
  description?: string;
}
