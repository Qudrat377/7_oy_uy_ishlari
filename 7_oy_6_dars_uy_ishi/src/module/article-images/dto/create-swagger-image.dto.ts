import { ApiProperty } from "@nestjs/swagger";
import { CreateArticleImageDto } from "./create-article-image.dto";
import { IsArray } from "class-validator";

export class ArticleSwaggerImagesDto extends CreateArticleImageDto {
  @IsArray()
  @ApiProperty({
    type: "string",
    format: "binary",
    isArray: true
  })
  files: any[];
}