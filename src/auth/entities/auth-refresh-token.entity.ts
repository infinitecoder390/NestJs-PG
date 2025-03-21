import { CommonEntity } from 'src/commons/models/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('auth_refresh_token')
export class AuthRefreshToken extends CommonEntity {
  @Column({ type: 'bigint' })
  refresh_token_expires_at: number;

  @Column()
  client_id: string;

  @Column()
  user_id: string;

  // @Column({ nullable: true })
  // orgId: string;

  @Column({ type: 'bigint', nullable: true })
  last_used_at: number;
}
