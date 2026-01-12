import { Entity, Column } from 'typeorm';
import { BaseEntityClass } from '../common/base.entity';
import { NotificationType } from 'shared';

@Entity('notifications')
export class Notification extends BaseEntityClass {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @Column({ type: 'int', nullable: true })
  branchId: number | null;
}