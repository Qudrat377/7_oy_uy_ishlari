import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString, Length } from "class-validator";

export class CreateAuthDto {
    @IsString({message: "string bo'lishi kerak"})
    @Length(3, 50)
    @ApiProperty({default: "ali"})
    username: string;

    @IsString()
    @IsEmail()
    @ApiProperty({default: "assomad377@gmail.com"})
    email: string;

    @IsString()
    @ApiProperty({default: "123213"})
    password: string;
}

export class LoginAuthDto {
    @IsString()
    @IsEmail()
    @ApiProperty({default: "assomad377@gmail.com"})
    email: string;

    @IsString()
    @ApiProperty({default: "123213"})
    password: string;
}

