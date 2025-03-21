import { NonUUidBaseEntity } from 'src/commons/models/nonuuid.base.entity';
import { Column, Entity } from 'typeorm';

@Entity('permission')
export class Permissions extends NonUUidBaseEntity {
  @Column()
  display_name: string;

  @Column()
  is_admin: boolean;

  @Column('text', { array: true })
  scopes: string[];

  @Column('text', { array: true })
  fe_scopes: string[];
}
