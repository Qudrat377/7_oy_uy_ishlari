import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./module/auth/auth.module";
import { Auth } from "./module/auth/entities/auth.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleModule } from "./module/article/article.module";
import { Article } from "./module/article/entities/article.entity";
import { Tag } from "./module/tags/entities/tag.entity";
import { TagsModule } from "./module/tags/tags.module";
import { ArticleImage } from "./module/article-images/entities/article-image.entity";
import { ArticleImagesModule } from "./module/article-images/article-images.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      username: "postgres",
      port: 5432,
      host: "localhost",
      password: String(process.env.DB_PASSWORD),
      database: String(process.env.DB_NAME),
      entities: [Auth, Article, Tag, ArticleImage],
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    ArticleModule,
    TagsModule,
    ArticleImagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
