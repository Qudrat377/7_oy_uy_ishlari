import { IsString, Length } from "class-validator";

export class CreateArticleDto {
    @IsString()
    @Length(10, 500)
    heading: string;

    @IsString()
    @Length(20, 20000)
    body: string;

    @IsString()
    @Length(20, 500)
    backgroundImage: string;
}
