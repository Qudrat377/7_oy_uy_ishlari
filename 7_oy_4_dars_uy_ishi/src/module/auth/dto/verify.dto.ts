import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class VerifyAuthDto {
    @ApiProperty({default: "assomad377@gmail.com"})
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({default: "837462"})
    @IsString()
    otp: string;
}