import { UserRole } from 'src/common/enums/role.enum';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserAuth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
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

  @Column({ nullable: true })
  googleId: string;
}
