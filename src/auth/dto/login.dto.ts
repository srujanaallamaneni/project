import {IsEmail,IsNotEmpty,IsString} from 'class-validator';
import {ApiProperty} from  '@nestjs/swagger';
export class LoginDto{
        @ApiProperty({description:"User email used for login",example:'john12@gmail.com'})
        @IsEmail()
        email:string;

        @ApiProperty({description:'Password for the user account',example:'strongPassword123'})
        @IsString()
        @IsNotEmpty()
        password:string;

    }
