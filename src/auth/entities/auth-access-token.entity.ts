import { CommonEntity } from 'src/commons/models/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('auth_access_token')
export class AuthAccessToken extends CommonEntity {
  @Column({ type: 'bigint' })
  access_token_expires_at: number;

  @Column()
  client_id: string;

  @Column()
  user_id: string;

  @Column()
  refresh_token_id: string;
}
