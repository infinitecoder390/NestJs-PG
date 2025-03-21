import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthClient } from '../entities/auth-client.entity';
import { CommonMethods } from 'src/commons/utils/common-methods';

@Injectable()
export class AuthClientRepository {
  constructor(
    @InjectRepository(AuthClient)
    private authClientRepo: Repository<AuthClient>,
  ) {}

  async findOne(id: string) {
    const authClient = await this.authClientRepo.findOne({ where: { id } });
    if (!authClient)
      throw new ForbiddenException(CommonMethods.getErrorMsg('E_1002'));

    return authClient;
  }
}
