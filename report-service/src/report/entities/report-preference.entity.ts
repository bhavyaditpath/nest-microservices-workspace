import { Entity, Column } from 'typeorm';
import { BaseEntityClass } from '../../common/base.entity';
import { ReportType } from 'shared';
import { DeliveryMethod } from 'shared';

@Entity('report_preferences')
export class ReportPreference extends BaseEntityClass {
  @Column({ type: 'int' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  reportType: ReportType;

  @Column({
    type: 'enum',
    enum: DeliveryMethod,
    default: DeliveryMethod.LOCAL_FILE,
  })
  deliveryMethod: DeliveryMethod;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}