import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString, Length } from "class-validator";

export class CreateAuthDto {
    @ApiProperty({default: "ali"})
    @IsString({message: "string bo'lishi kerak"})
    @Length(3, 50)
    username: string;

    @ApiProperty({default: "assomad377@gmail.com"})
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({default: "123213"})
    @IsString()
    password: string;
}

export class LoginAuthDto {
    @ApiProperty({default: "assomad377@gmail.com"})
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({default: "123213"})
    @IsString()
    password: string;
}

