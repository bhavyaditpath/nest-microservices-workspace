import { BaseEntityClass } from "src/common/base.entity";
import { Column, Entity } from "typeorm";

@Entity('purchases')
export class Purchase extends BaseEntityClass {
  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 50 })
  unit: string; // pieces/boxes/kgs

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerUnit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'int' })
  lowStockThreshold: number;

  @Column({ type: 'varchar', length: 255 })
  brand: string;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int', nullable: true })
  branchId: number | null;
}