import { RequestStatus } from "shared";
import { Column, Entity } from "typeorm";
import { BaseEntityClass } from "../common/base.entity";

@Entity('requests')
export class Request extends BaseEntityClass {
  @Column({ type: 'int' })
  requestingUserId: number;

  @Column({ type: 'int' })
  adminUserId: number;

  @Column({ type: 'int' })
  purchaseId: number;

  @Column({
    type: "enum",
    enum: RequestStatus,
    default: RequestStatus.REQUEST,
  })
  status: RequestStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityRequested: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}