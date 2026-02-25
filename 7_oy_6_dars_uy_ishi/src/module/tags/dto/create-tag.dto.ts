import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateTagDto {
    @IsString()
    @ApiProperty({default: "HTML"})
    name: string;
}
