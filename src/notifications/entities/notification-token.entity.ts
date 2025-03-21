import { CommonEntity } from 'src/commons/models/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum NotificationTokenStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}
@Entity({ name: 'notification_tokens' })
export class NotificationToken extends CommonEntity {
  @Column()
  user_id: string;

  @Column()
  device_type: string;

  @Column()
  device_id: string;

  @Column()
  fcm_token: string;

  @Column({
    type: 'enum',
    enum: NotificationTokenStatus,
    nullable: true,
    default: NotificationTokenStatus.ACTIVE,
  })
  status: NotificationTokenStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
