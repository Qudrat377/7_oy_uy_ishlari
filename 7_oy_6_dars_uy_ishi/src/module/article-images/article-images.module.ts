import { Module } from '@nestjs/common';
import { ArticleImagesService } from './article-images.service';
import { ArticleImagesController } from './article-images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleImage } from './entities/article-image.entity';
import { Article } from '../article/entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleImage, Article])],
  controllers: [ArticleImagesController],
  providers: [ArticleImagesService],
})
export class ArticleImagesModule {}
