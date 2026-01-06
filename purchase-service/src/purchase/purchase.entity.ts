import { BaseEntityClass } from "src/common/base.entity";
import { Column, Entity } from "typeorm";
import { IsNumberString, IsOptional } from "class-validator";

@Entity("purchases")
export class Purchase extends BaseEntityClass {
  @Column({ unique: true })
  productName: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "varchar", nullable: true })
  @IsOptional()
  @IsNumberString()
  quantity?: string;
}