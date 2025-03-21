import { NonUUidBaseEntity } from 'src/commons/models/nonuuid.base.entity';
import { UserRole } from 'src/user-roles/entities/user-role.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('role')
export class Roles extends NonUUidBaseEntity {
  @Column()
  display_name: string;

  @Column()
  is_admin: boolean;

  @Column({ nullable: true })
  is_default: boolean;

  @Column('text', {
    array: true,
    default: () => 'ARRAY[]::text[]',
    nullable: true,
  })
  permission_ids: string[];

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
