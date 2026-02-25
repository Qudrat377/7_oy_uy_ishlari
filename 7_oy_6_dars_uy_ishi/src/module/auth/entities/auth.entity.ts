import { BaseEntity } from "src/database/base.entity";
import { Article } from "src/module/article/entities/article.entity";
import { Tag } from "src/module/tags/entities/tag.entity";
import { UserRole } from "src/shared/constants/user.role";
import { Column, Entity, OneToMany} from "typeorm";

@Entity({name: "auth"})
export class Auth extends BaseEntity {
    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({default: 0,})
    otp: string;

    @Column({type: "bigint"})
    otpTime: number;

    @Column({default: UserRole.USER})
    role: UserRole;

    // relations
    @OneToMany(() => Article, (article) => article.author)
    articles: Article[];

    // relations
    @OneToMany(() => Tag, (tag) => tag.createdBy)
    tags: Tag[];
}
