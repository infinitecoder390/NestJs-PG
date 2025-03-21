import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationConstants } from 'src/commons/constants/application.constant';
import { LoggerService } from 'src/commons/logger/logger.service';
import { CommonMethods } from 'src/commons/utils/common-methods';
import { PermissionsRepository } from 'src/permissions/respository/permissions.repo';
import { UserRolesRepository } from 'src/user-roles/repository/user-roles.repo';
import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repository/user.repo';
import { Repository } from 'typeorm';
import { CheckAuthDto } from './dto/check-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthAccessToken } from './entities/auth-access-token.entity';
import { AuthClient } from './entities/auth-client.entity';
import { AuthRefreshToken } from './entities/auth-refresh-token.entity';
import { IAuthRefreshToken } from './interfaces/auth-refresh-token.interface';
import { AuthClientRepository } from './repository/auth-client.repo';
import { AuthAccessTokenService } from './services/auth-access-token.service';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(AuthAccessToken)
    private authAccessTokenRepo: Repository<AuthAccessToken>,
    @InjectRepository(AuthRefreshToken)
    private authRefreshTokenRepo: Repository<AuthRefreshToken>,
    private readonly userRepo: UserRepository,
    private readonly authClientRepo: AuthClientRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly loggerService: LoggerService,
    private authAccessTokenService: AuthAccessTokenService,
    private readonly userRoleRepo: UserRolesRepository,
    private readonly permissionRepo: PermissionsRepository,
  ) {}

  async create(clientId: string, createAuthDto: LoginAuthDto) {
    console.log('cliID', clientId);
    const authClient = await this.authClientRepo.findOne(clientId);
    const user = await this.userRepo.findOneByQuery({
      phone: createAuthDto.phone,
      is_active: true,
      is_deleted: false,
    });
    if (!user) {
      throw new BadRequestException(CommonMethods.getErrorMsg('USR_1013'));
    }
    const passwordMatches = await CommonMethods.comparePasswordHash(
      createAuthDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new ForbiddenException(CommonMethods.getErrorMsg('E_7003'));
    }

    const refreshToken = await this.generateRefreshToken(user, authClient);
    const accessToken = await this.generateAccessToken(
      user.id,
      refreshToken.id,
      authClient,
    );

    return await this.getClientJwtTokens(accessToken, refreshToken, authClient);
  }

  async getClientJwtTokens(
    accessToken: AuthAccessToken,
    refreshToken: AuthRefreshToken,
    authClient: AuthClient,
  ) {
    this.logger.debug('Inside getClientJwtTokens');
    this.logger.debug(`authClient, ${JSON.stringify(authClient)}`);
    this.logger.debug(`userId, ${refreshToken.user_id}`);

    const userRoles = await this.userRoleRepo.findByQuery(
      { is_active: true, is_deleted: false, user_id: refreshToken.user_id },
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      ['user', 'role'],
    );

    const roles = userRoles?.data?.map((aRole) => aRole.role);
    if (!roles?.length) {
      this.logger.error('No roles found for the user');
      throw new BadRequestException(CommonMethods.getErrorMsg('E_1013'));
    }

    const permissionIds = [];
    const roleMapWithPerms = new Map();
    let isAdmin = false;

    for (const aRole of roles) {
      if (aRole.permission_ids.indexOf('ADMIN') > -1) {
        isAdmin = true;
      }

      permissionIds.push(...aRole.permission_ids);
      roleMapWithPerms.set(aRole.id, aRole.permission_ids);
    }
    this.loggerService.debug(`roleMapWithPerms, ${roleMapWithPerms}`);

    this.loggerService.debug(`permissionIds, ${permissionIds}`);

    const permissions = await this.permissionRepo.findByIds(permissionIds);

    this.loggerService.debug(`permissions, ${permissions}`);

    const permMapWithScopes = new Map();
    for (const aPerm of permissions) {
      permMapWithScopes.set(aPerm.id, aPerm);
    }
    const scopesFinal = [];
    const feScopesFinal = [];

    for (const anUrole of userRoles?.data) {
      const perms = roleMapWithPerms.get(anUrole.role.id);

      if (perms) {
        for (const aperm of perms) {
          const permission = permMapWithScopes.get(aperm);

          let scopes = permission.scopes;
          let feScopes = permission.fe_scopes;
          if (
            anUrole?.permission_entity &&
            Object.keys(anUrole?.permission_entity).length > 0
          ) {
            for (const [key, value] of Object.entries(
              anUrole.permission_entity,
            )) {
              this.loggerService.debug(`${key}: ${value}`);

              scopes = scopes.map(function (x) {
                return x.replace('$' + `{${key}}`, value);
              });
              feScopes = feScopes.map(function (x) {
                return x.replace('$' + `{${key}}`, value);
              });
            }
          }

          scopesFinal.push(...scopes);
          feScopesFinal.push(...feScopes);
        }
      }
    }

    const accessTokenJwtPayload = {
      sub: accessToken.user_id,
      jti: accessToken.id,
      client_id: authClient.id,
      baseUrl: this.configService.get('IMG_BASEURL'),
      isAdmin,
      role: roles[0]?.id,
      aud: this.configService.get('JWT_AUD'),
      scopes: [...new Set(scopesFinal)],
      fe_scopes: [...new Set(feScopesFinal)],
      permission_ids: [...new Set(permissionIds)],
    };
    const refreshTokenJwtPayload = {
      sub: refreshToken.user_id,
      jti: refreshToken.id,
      aud: this.configService.get('JWT_AUD'),
    };
    console.log('jwtsecret', this.configService.get('JWT_SECRET'));

    const tokenExpiryInSeconds = Math.floor(
      authClient.accessTokenExpiry / 1000,
    );

    const refreshTokenExpiryInSeconds = Math.floor(
      authClient.refreshTokenExpiry / 1000,
    );

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(accessTokenJwtPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: tokenExpiryInSeconds,
      }),
      this.jwtService.signAsync(refreshTokenJwtPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: refreshTokenExpiryInSeconds,
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async generateAccessToken(
    userId: string,
    refreshTokenId: string,
    authClient: AuthClient,
  ) {
    const accessToken = {
      user_id: userId,
      refresh_token_id: refreshTokenId,
      client_id: authClient.id,
      access_token_expires_at: Date.now() + authClient.accessTokenExpiry,
    };

    return await this.authAccessTokenRepo.save(accessToken);
  }
  async generateRefreshToken(
    user: User,
    authClientStore: AuthClient,
  ): Promise<AuthRefreshToken> {
    const refreshToken = {
      client_id: authClientStore.id,
      user_id: user.id,
      refresh_token_expires_at: Date.now() + authClientStore.refreshTokenExpiry,
    };

    console.log('refreshToken', refreshToken);

    return await this.authRefreshTokenRepo.save(refreshToken);
  }

  async checkAuthorization(checkAuthDto: CheckAuthDto): Promise<boolean> {
    this.loggerService.debug(
      'checkAuthDto --> ' + JSON.stringify(checkAuthDto),
    );

    try {
      const decoded = this.jwtService.verify(checkAuthDto?.jwt, {
        secret: this.configService.get('JWT_SECRET'),
      });

      this.loggerService.debug(`decoded >> ${decoded}`);

      const accessToken = await this.authAccessTokenService.getAccessToken(
        decoded.jti,
      );

      this.loggerService.debug(`accessToken >> ${accessToken}`);

      if (!accessToken) {
        throw new UnauthorizedException(CommonMethods.getErrorMsg('E_1007'));
      }
      if (accessToken) {
        const urlItems = checkAuthDto.apiEndPoint.split(/\/v[1-9]\//);
        const urlToValidate = urlItems[0] + '/' + urlItems[1];

        this.loggerService.debug('Checking for whitelisted urls');
        if (
          this.isUrlWhitelisted(urlToValidate, checkAuthDto, {
            orgId: decoded?.orgId,
          })
        ) {
          this.loggerService.debug(
            'whitelisted url matched for Backend Scopes.',
          );
          return decoded;
        }

        this.loggerService.debug(
          'Checking for Backend Scopes >>>>>>>>>>>>>>>>',
        );
        if (decoded.scopes) {
          const isMatched = this.checkScopesMatch(
            decoded.scopes,
            urlToValidate,
            checkAuthDto,
          );

          if (isMatched) {
            return decoded;
          }
        }
      }
    } catch (e) {
      this.loggerService.error(
        'authorization service -- Error in check authorization : ' + e.stack,
      );
      throw new UnauthorizedException(CommonMethods.getErrorMsg('E_1007'));
    }
    this.loggerService.error('User is forbidden to go ahead...');
    throw new ForbiddenException(CommonMethods.getErrorMsg('E_1008'));
  }

  checkScopesMatch(
    scopes: string[],
    urlToValidate: string,
    checkAuthDto: CheckAuthDto,
  ) {
    for (const aScope of scopes) {
      this.loggerService.debug('aScope --> ' + aScope);

      const scopeMethod = aScope.split('::')[0];
      let scopeEndPoint = aScope.split('::')[1];
      if ('ALL' == scopeMethod || scopeMethod == checkAuthDto.httpMethod) {
        scopeEndPoint = scopeEndPoint
          .replaceAll('?', '\\?')
          .replaceAll('permission_entity.', 'permission_entity\\.')
          .replaceAll(',', '|'); // Handle multiple IDs

        const regex = new RegExp(scopeEndPoint);
        this.loggerService.debug('Request endpoint ' + urlToValidate);
        this.loggerService.debug('Scope EndPoint ' + regex);
        this.loggerService.debug('Scope Method ' + scopeMethod);

        const isMatched = regex.test(urlToValidate);
        this.loggerService.debug('isMatched --> ' + isMatched);
        this.loggerService.debug(
          '===================================================================',
        );

        if (!isMatched) continue;
        return true;
      }
    }

    return false;
  }

  isUrlWhitelisted(
    urlToValidate: string,
    checkAuthDto: CheckAuthDto,
    params: object,
  ) {
    const wUrls = this.configService.get('WHITE_LISTED_URLS').split(',');

    const resolvedScoped = [];

    for (const aUrl of wUrls) {
      resolvedScoped.push(CommonMethods.getKeyReplacedString(aUrl, params));
    }

    this.loggerService.debug(
      'whitelisted resolvedScoped --> ' + resolvedScoped,
    );

    if (this.checkScopesMatch(resolvedScoped, urlToValidate, checkAuthDto)) {
      return true;
    }

    return false;
  }

  async getAccessTokenByRefreshToken(
    clientId: string,
    jwtRefreshToken: string,
  ) {
    let client;
    try {
      client = await this.authClientRepo.findOne(clientId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    this.loggerService.debug('client --> ' + client);

    let decodedRefreshToken;
    try {
      decodedRefreshToken = this.jwtService.verify(jwtRefreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (e) {
      this.loggerService.error('error while decoding refresh token --> ' + e);
      throw new BadRequestException(CommonMethods.getErrorMsg('E_7004'));
    }

    this.loggerService.debug(
      'decodedRefreshToken >> ' + JSON.stringify(decodedRefreshToken),
    );

    const refreshToken = await this.authRefreshTokenRepo.findOne({
      where: { id: decodedRefreshToken.jti },
    });

    this.loggerService.debug('refreshToken >> ' + refreshToken);

    this.validateAccessTokenRequest(refreshToken);

    await this.authAccessTokenService.deleteAccessTokenByRefreshToken(
      refreshToken.id,
    );
    const accessToken = await this.generateAccessToken(
      refreshToken.user_id,
      refreshToken.id,
      client,
    );

    refreshToken.last_used_at = Date.now();
    await this.authRefreshTokenRepo.save(refreshToken);

    const tokens = await this.getClientJwtTokens(
      accessToken,
      refreshToken,
      client,
    );

    delete tokens['refreshToken'];

    return tokens;
  }

  validateAccessTokenRequest(refreshToken: IAuthRefreshToken) {
    if (!refreshToken) {
      throw new BadRequestException(CommonMethods.getErrorMsg('E_1009'));
    }

    const timeWindow = ApplicationConstants.ATRegenerateExecutionTimeWindow;

    const lastUsedAt = refreshToken.last_used_at
      ? Number(refreshToken.last_used_at)
      : 0;

    if (lastUsedAt + timeWindow * 1000 > Date.now()) {
      throw new BadRequestException(CommonMethods.getErrorMsg('E_1010'));
    }
  }

  async logOut(clientId: string, authAccessToken: string) {
    await this.validateClient(clientId);
    const decoded = this.decodeAccessToken(authAccessToken);
    await this.processLogOut(decoded.jti);
    return { accessToken: authAccessToken };
  }

  // async sendOtp(userName: string): Promise<void> {
  //   const user: User = await this.userRepo.findOneByQuery({
  //     userName,
  //     isActive: true,
  //     isDeleted: false,
  //   });
  //   if (!user) {
  //     throw new BadRequestException(CommonMethods.getErrorMsg('usr_1035'));
  //   }

  //   const otp = Math.floor(100000 + Math.random() * 900000).toString();
  //   user.otp = otp;
  //   user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

  //   await this.userRepo.updateOne(user.id, user);

  //   this.mailService.sendCustomEmail(
  //     user.email,
  //     'Reset Password OTP',
  //     'otp-template',
  //     { otp, userName },
  //   );
  // }

  // async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<User> {
  //   const user: User = await this.userRepo.findOneByQuery({
  //     userName: verifyOtpDto.userName,
  //     isActive: true,
  //     isDeleted: false,
  //   });

  //   if (!user) {
  //     throw new BadRequestException(CommonMethods.getErrorMsg('usr_1035'));
  //   }

  //   if (user.otp !== verifyOtpDto.otp || user.otpExpiry < new Date()) {
  //     throw new BadRequestException(CommonMethods.getErrorMsg('usr_1030'));
  //   }
  //   return user;
  // }

  // async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User> {
  //   const user = await this.verifyOtp(resetPasswordDto);

  //   user.password = await CommonMethods.generatePasswordHash(
  //     resetPasswordDto.newPassword,
  //   );
  //   user.otp = null;
  //   user.otpExpiry = null;
  //   return await this.userRepo.updateOne(user.id, user);
  // }

  private async validateClient(clientId: string): Promise<void> {
    try {
      await this.authClientRepo.findOne(clientId);
    } catch (error) {
      throw new BadRequestException(CommonMethods.getErrorMsg('E_1002'));
    }
  }

  async deleteUserSessionDetails(userId: string): Promise<boolean> {
    if (!userId) {
      throw new BadRequestException(CommonMethods.getErrorMsg('usr_1035'));
    }
    let userSessionDeleted = false;
    const accessTokenDeleted =
      await this.authAccessTokenService.deleteUserAccessToken(userId);
    if (accessTokenDeleted) {
      userSessionDeleted = await this.deleteUserRefreshToken(userId);
    }
    return userSessionDeleted;
  }

  async deleteUserRefreshToken(id: string): Promise<boolean> {
    const result = await this.authRefreshTokenRepo.delete({ user_id: id });
    return result.affected > 0;
  }

  private decodeAccessToken(authAccessToken: string): any {
    try {
      const jwt = authAccessToken?.split(' ')[1];
      return this.jwtService.verify(jwt, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new BadRequestException(CommonMethods.getErrorMsg('E_1007'));
    }
  }

  private async processLogOut(jti: string): Promise<void> {
    const accessToken = await this.authAccessTokenService.getAccessToken(jti);
    if (!accessToken) {
      throw new ForbiddenException(CommonMethods.getErrorMsg('E_1008'));
    }

    await this.deleteUserSessionDetails(accessToken.user_id);
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
