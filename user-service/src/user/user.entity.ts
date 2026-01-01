import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntityClass } from "src/common/base.entity";
import { UserRole } from "src/common/enums/role.enum";

@Entity("users")
@Index(['username', 'branchId'], { unique: true })
export class User extends BaseEntityClass {

  @Column()
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
  })
  role: UserRole;

  @Column()
  branchId: number;

  // Google OAuth fields
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  googleId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  profilePicture: string;
}
