import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../entities/roles.entity';
import { FilterQueryDto } from 'src/commons/dtos/filter-query.dto';
import { CommonRepositoryImpl } from 'src/commons/repository/common.repo';

@Injectable()
export class RolesRepository extends CommonRepositoryImpl<
  Roles,
  FilterQueryDto
> {
  constructor(
    @InjectRepository(Roles)
    orderRepo: Repository<Roles>,
  ) {
    super(orderRepo, new Logger(RolesRepository.name));
  }
}
