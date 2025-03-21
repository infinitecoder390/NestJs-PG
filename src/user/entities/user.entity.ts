import { Exclude, Expose } from 'class-transformer';
import { CommonEntity } from 'src/commons/models/base.entity';
import { Notifications } from 'src/notifications/entities/notification.entity';
import { UserRole } from 'src/user-roles/entities/user-role.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('user')
export class User extends CommonEntity {
  @Column({ unique: true })
  entity_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ unique: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  profile_image: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  dept: string;

  @Column({ nullable: true })
  deactivated_date: Date;

  @Column({ nullable: true })
  email: string;

  @Expose()
  get masked_phone(): string | null {
    if (this.phone) {
      // Return masked phone like: 99XXXX8X99
      return `${this.phone[0]}${this.phone[1]}XXXX${this.phone[6]}X${this.phone[8]}${this.phone[9]}`;
    }
    return null;
  }

  @OneToMany(() => Notifications, (notification) => notification.from_user)
  notifications_from: Notifications[];

  @OneToMany(() => Notifications, (notification) => notification.to_user)
  notifications_to: Notifications[];



  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];


}
