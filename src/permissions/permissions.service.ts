import { Injectable } from '@nestjs/common';
import { PaginationDTO } from 'src/commons/dtos/pagination.dto';
import { PermissionsRepository } from './respository/permissions.repo';
import { In, Not } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionRepo: PermissionsRepository) {}

  async findAll(params: PaginationDTO) {
    const { page, limit, keyword, sort, order, pageOff } = params;
    const searchColumns = ['display_name'];
    const sortingColumns = sort ? [sort] : undefined;
    const orderValue = order === 'ASC' ? 1 : -1;

    const permissions = await this.permissionRepo.findByQuery(
      { is_active: true, is_deleted: false,id: Not(In(['ADMIN'])), },
      page,
      limit,
      keyword,
      searchColumns,
      undefined,
      sortingColumns,
      orderValue,
      pageOff,
    );

    return permissions;
  }
}
