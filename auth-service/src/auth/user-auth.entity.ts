import { UserRole } from 'src/common/enums/role.enum';
import { Entity, Column } from 'typeorm';
import { IsEmail } from 'class-validator';
import { BaseEntityClass } from 'src/common/base.entity';

@Entity('users')
export class UserAuth extends BaseEntityClass {
  
  @Column()
  @IsEmail()
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ nullable: true })
  branchId: number;

  @Column({ default: false })
  isEmailVerified: boolean;

  // Google OAuth fields
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  googleId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  profilePicture: string;
}
