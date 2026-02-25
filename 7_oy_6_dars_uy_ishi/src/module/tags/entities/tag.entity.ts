import { BaseEntity } from "src/database/base.entity";
import { Article } from "src/module/article/entities/article.entity";
import { Auth } from "src/module/auth/entities/auth.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";

@Entity({name: "tags"})
export class Tag extends BaseEntity {
    @Column({unique: true}) 
    name: string;

    // relations 
    @ManyToOne(() => Auth, (user) => user.tags)
    @JoinColumn({name: "created_by"})
    createdBy: Auth

    @ManyToMany(() => Article, (article) => article.tags)
    articles: Article[];
}
