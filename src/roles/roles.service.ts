import { Injectable } from '@nestjs/common';
import { PaginationDTO } from 'src/commons/dtos/pagination.dto';
import { LoggerService } from 'src/commons/logger/logger.service';
import { In, Not } from 'typeorm';
import { RolesRepository } from './repository/roles.repo';

@Injectable()
export class RolesService {
  private readonly logger: LoggerService;

  constructor(private readonly roleRepository: RolesRepository) {
    this.logger = new LoggerService();
  }

  async findAll(params: PaginationDTO) {
    const { page, limit, keyword, sort, order, pageOff } = params;
    const searchColumns = ['display_name'];
    const sortingColumns = sort ? [sort] : undefined;
    const orderValue = order === 'ASC' ? 1 : -1;

    const roles = await this.roleRepository.findByQuery(
      { is_active: true, is_deleted: false, id: Not(In(['ADMIN'])) },
      page,
      limit,
      keyword,
      searchColumns,
      undefined,
      sortingColumns,
      orderValue,
      pageOff,
    );

    return roles;
  }

  async findOne(id: string) {
    return await this.roleRepository.findOneByQuery({
      id,
      is_active: true,
      is_deleted: false,
    });
  }
}
