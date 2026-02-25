import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class QueryDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({default: 1, minimum: 1})
    page?: number = 1;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({default: 10, minimum: 1, maximum: 100})
    limit?: number = 10;

    @IsString()
    @IsOptional()
    @ApiProperty({default: "HTML"}) //@ApiPropertyOptional()
    search?: string;
}