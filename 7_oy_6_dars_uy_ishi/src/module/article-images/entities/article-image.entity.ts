import { BaseEntity } from "src/database/base.entity";
import { Article } from "src/module/article/entities/article.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity({name: "article_images"})
export class ArticleImage extends BaseEntity {
    @Column({type: "varchar", length: 500})
    url: string;

    @Column()
    sortOrder: number;

    @ManyToOne(() => Article, (article) => article.images, {cascade: true})
    article: Article
}
