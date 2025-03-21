import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQueryDto } from 'src/commons/dtos/filter-query.dto';
import { CommonRepositoryImpl } from 'src/commons/repository/common.repo';
import { Repository } from 'typeorm';
import { Permissions } from '../entities/permissions.entity';

@Injectable()
export class PermissionsRepository extends CommonRepositoryImpl<
  Permissions,
  FilterQueryDto
> {
  constructor(
    @InjectRepository(Permissions)
    permissionRepo: Repository<Permissions>,
  ) {
    super(permissionRepo, new Logger(PermissionsRepository.name));
  }
}
