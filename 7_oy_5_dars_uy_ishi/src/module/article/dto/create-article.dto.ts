import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsInt, IsString, Length } from "class-validator";

export class CreateArticleDto {
  @IsString()
  @Length(2, 500)
  @ApiProperty({ default: "CSS" })
  heading: string;

  @IsString()
  @Length(20, 20000)
  @ApiProperty({ default: "CSS is most popular style sheets in the world" })
  body: string;

  @Transform(({value}) => 
  typeof value === "string" 
  ? value.split(",").map((v) => Number(v))
  : value
  )
  @IsArray()
  @IsInt({each: true})
  @ApiProperty({default: [1, 2, 3]})
  tags: number[];
}
