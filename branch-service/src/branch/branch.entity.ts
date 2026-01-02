import { BaseEntityClass } from "src/common/base.entity";
import { Column, Entity } from "typeorm";
import { IsNumberString, IsOptional } from "class-validator";

@Entity("branches")
export class Branch extends BaseEntityClass {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: "varchar", nullable: true })
  @IsOptional()
  @IsNumberString()
  phone?: string;
}