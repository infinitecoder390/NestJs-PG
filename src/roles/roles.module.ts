import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepository } from './repository/roles.repo';
import { LoggerService } from 'src/commons/logger/logger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from './entities/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Roles])],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, LoggerService],
})
export class RoleModule { }
