import { CommonEntity } from 'src/commons/models/base.entity';
import { Roles } from 'src/roles/entities/roles.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

@Entity('user_role')
@Unique(['user_id', 'role_id'])
export class UserRole extends CommonEntity {
  @Column()
  user_id: string;

  @Column()
  role_id: string;

  @Column('jsonb', { nullable: true })
  permission_entity: {
    user_id: string;
  };

  @ManyToOne(() => User, (user) => user.userRoles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Roles, (role) => role.userRoles)
  @JoinColumn({ name: 'role_id' })
  role: Roles;
}
