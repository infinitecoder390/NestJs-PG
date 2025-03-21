import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { LoggerService } from 'src/commons/logger/logger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from './entities/permissions.entity';
import { PermissionsRepository } from './respository/permissions.repo';

@Module({
  imports: [TypeOrmModule.forFeature([Permissions])],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository, LoggerService],
})
export class PermissionsModule {}
