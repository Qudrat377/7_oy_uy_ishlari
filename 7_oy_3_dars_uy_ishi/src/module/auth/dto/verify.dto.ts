import { IsEmail, IsString } from "class-validator";

export class VerifyAuthDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    otp: string;
}