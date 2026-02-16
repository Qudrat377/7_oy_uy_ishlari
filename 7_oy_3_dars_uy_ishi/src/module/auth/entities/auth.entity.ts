import { BaseEntity } from "src/database/base.entity";
import { UserRole } from "src/shared/constants/user.role";
import { Column, Entity} from "typeorm";

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
}
