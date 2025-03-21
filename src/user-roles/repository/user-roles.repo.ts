import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from 'src/commons/logger/logger.service';
import { CommonRepositoryImpl } from 'src/commons/repository/common.repo';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';
import { UserRolesFilterQueryDto } from '../dto/user-roles-filter-query.dto';

@Injectable()
export class UserRolesRepository extends CommonRepositoryImpl<
  UserRole,
  UserRolesFilterQueryDto
> {
  constructor(
    @InjectRepository(UserRole)
    private userPermissionRepo: Repository<UserRole>,
    private readonly loggerService: LoggerService,
  ) {
    super(userPermissionRepo, new Logger(UserRolesRepository.name));
  }
}
