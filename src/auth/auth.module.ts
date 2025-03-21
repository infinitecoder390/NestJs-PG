import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from 'src/commons/logger/logger.service';
import { Permissions } from 'src/permissions/entities/permissions.entity';
import { PermissionsRepository } from 'src/permissions/respository/permissions.repo';
import { Roles } from 'src/roles/entities/roles.entity';
import { RolesRepository } from 'src/roles/repository/roles.repo';
import { UserRole } from 'src/user-roles/entities/user-role.entity';
import { UserRolesRepository } from 'src/user-roles/repository/user-roles.repo';
import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repository/user.repo';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthAccessToken } from './entities/auth-access-token.entity';
import { AuthClient } from './entities/auth-client.entity';
import { AuthRefreshToken } from './entities/auth-refresh-token.entity';
import { AuthAccessTokenRepo } from './repository/auth-access-token.repo';
import { AuthClientRepository } from './repository/auth-client.repo';
import { AuthAccessTokenService } from './services/auth-access-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AuthClient,
      AuthAccessToken,
      AuthRefreshToken,
      Roles,
      Permissions,
      UserRole,
    ]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthClientRepository,
    UserRepository,
    LoggerService,
    AuthAccessTokenService,
    AuthAccessTokenRepo,
    RolesRepository,
    PermissionsRepository,
    UserRolesRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
