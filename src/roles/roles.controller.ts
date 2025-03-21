import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationDTO } from 'src/commons/dtos/pagination.dto';
import { SuccessResponseDto } from 'src/commons/dtos/success-response.dto';
import { RolesService } from './roles.service';

@ApiBearerAuth()
@ApiTags('Roles')
@Controller({
  version: '1',
  path: 'roles',
})
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Get()
  async findAll(@Query() queryParams: PaginationDTO) {
    const roles = await this.roleService.findAll({ ...queryParams });
    return SuccessResponseDto.getResponseObject(
      roles,
      'Success in fetching Roles',
      null,
      queryParams?.pageOff,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const role = await this.roleService.findOne(id);
    return SuccessResponseDto.getResponseObject(
      role,
      'Success in fetching Role',
      null,
    );
  }
}
