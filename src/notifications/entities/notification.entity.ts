import { CommonEntity } from 'src/commons/models/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NotificationToken } from './notification-token.entity';

export enum NotificationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}
export enum NotifyTitleType {
  REJECTED = `Visitor Rejected Notification`,
  APPROVED = 'Visitor Approved Notification',
  PENDING = 'New Visitor Entry Request',
  EXITED = 'Visitor Exit Notification',
  MARK_ATTENDANCE = 'Mark Attendance',
}
@Entity({ name: 'notifications' })
export class Notifications extends CommonEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  body: any;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    nullable: true,
    default: NotificationStatus.ACTIVE,
  })
  status: NotificationStatus;

  @Column({ nullable: true })
  from_user_id: string;

  @Column()
  to_user_id: string;

  @Column()
  notification_token_id: string;

  @ManyToOne(() => User, (user) => user.notifications_from, { nullable: true })
  @JoinColumn({ name: 'from_user', referencedColumnName: 'id' })
  from_user: User;

  @ManyToOne(() => User, (user) => user.notifications_to)
  @JoinColumn({ name: 'to_user', referencedColumnName: 'id' })
  to_user: User;

  @JoinColumn({ name: 'notification_token_id', referencedColumnName: 'id' })
  @ManyToOne(() => NotificationToken)
  notification_token: NotificationToken;
}
