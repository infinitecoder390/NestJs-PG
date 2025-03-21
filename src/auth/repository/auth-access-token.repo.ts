import { Injectable } from '@nestjs/common';
import { IAuthAccessToken } from '../interfaces/auth-access-token.interface';
import { CreateAuthAccessTokenDto } from '../dto/auth-access-token.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthAccessToken } from '../entities/auth-access-token.entity';

@Injectable()
export class AuthAccessTokenRepo {
  constructor(
    @InjectRepository(AuthAccessToken)
    private readonly authAccessTokenRepo: Repository<AuthAccessToken>,
  ) {}

  async findById(id: string): Promise<IAuthAccessToken> {
    return this.authAccessTokenRepo.findOne({ where: { id } });
  }

  async create(dto: CreateAuthAccessTokenDto): Promise<IAuthAccessToken> {
    const token = this.authAccessTokenRepo.create(dto);
    return this.authAccessTokenRepo.save(token);
  }

  async saveById(
    id: string,
    dto: Partial<CreateAuthAccessTokenDto>,
  ): Promise<IAuthAccessToken> {
    await this.authAccessTokenRepo.update(id, dto);
    return this.findById(id);
  }

  async deleteUserAccessToken(id: string): Promise<boolean> {
    const result = await this.authAccessTokenRepo.delete({ user_id: id });
    return result.affected > 0;
  }

  async deleteAccessTokenByRefreshToken(id: string): Promise<boolean> {
    const result = await this.authAccessTokenRepo.delete({
      refresh_token_id: id,
    });
    return result.affected > 0;
  }

  async getAccessToken(id: string): Promise<IAuthAccessToken> {
    return this.findById(id);
  }

  async deleteUsersAccessToken(ids: string[]): Promise<boolean> {
    const result = await this.authAccessTokenRepo.delete({ user_id: In(ids) });
    return result.affected > 0;
  }
}
