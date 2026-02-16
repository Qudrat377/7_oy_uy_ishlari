import { BaseEntity } from "src/database/base.entity";
import { Column, Entity } from "typeorm";

@Entity({name: "article"})
export class Article extends BaseEntity {
    @Column({length: 500})
    heading: string;

    @Column({type: "text", length: 20000})
    text: string;

    @Column({length: 500})
    backgroundImage: string;
}
