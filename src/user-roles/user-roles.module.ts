import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from 'src/commons/logger/logger.service';
import { Roles } from 'src/roles/entities/roles.entity';
import { RolesRepository } from 'src/roles/repository/roles.repo';
import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repository/user.repo';
import { UserRole } from './entities/user-role.entity';
import { UserRolesRepository } from './repository/user-roles.repo';
import { UserRolesController } from './user-roles.controller';
import { UserRolesService } from './user-roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User, Roles])],
  controllers: [UserRolesController],
  providers: [
    UserRolesService,
    UserRolesRepository,
    UserRepository,
    RolesRepository,
    LoggerService,
  ],
})
export class UserRolesModule {}
