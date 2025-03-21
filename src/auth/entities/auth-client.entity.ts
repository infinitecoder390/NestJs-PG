import { CommonEntity } from 'src/commons/models/base.entity';
import { Column, Entity } from 'typeorm';
@Entity('auth_client')
export class AuthClient extends CommonEntity {
  @Column()
  clientName: string;

  @Column()
  clientDescription: string;

  @Column()
  accessTokenExpiry: number;

  @Column()
  refreshTokenExpiry: number;

  @Column()
  platformName: string;
}
