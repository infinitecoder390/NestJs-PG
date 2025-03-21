import { Injectable } from '@nestjs/common';
import { AuthAccessTokenRepo } from '../repository/auth-access-token.repo';
import { CreateAuthAccessTokenDto } from '../dto/auth-access-token.dto';
import { IAuthAccessToken } from '../interfaces/auth-access-token.interface';

@Injectable()
export class AuthAccessTokenService {
  constructor(private readonly repo: AuthAccessTokenRepo) {}

  async create(
    authAccessTokenStore: CreateAuthAccessTokenDto,
  ): Promise<IAuthAccessToken> {
    return await this.repo.create(authAccessTokenStore);
  }

  async saveById(
    id: string,
    authAccessTokenStore: Partial<CreateAuthAccessTokenDto>,
  ): Promise<IAuthAccessToken> {
    return await this.repo.saveById(id, authAccessTokenStore);
  }

  async deleteUserAccessToken(id: string): Promise<boolean> {
    return await this.repo.deleteUserAccessToken(id);
  }
  async deleteAccessTokenByRefreshToken(refTokenId: string): Promise<boolean> {
    return await this.repo.deleteAccessTokenByRefreshToken(refTokenId);
  }

  async getAccessToken(id: string): Promise<IAuthAccessToken> {
    const accessToken: IAuthAccessToken = await this.repo.getAccessToken(id);
    return accessToken;
  }

  async deleteUsersAccessToken(ids: string[]): Promise<boolean> {
    return await this.repo.deleteUsersAccessToken(ids);
  }
}
