import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PaginationDTO } from 'src/commons/dtos/pagination.dto';
import { SuccessResponseDto } from 'src/commons/dtos/success-response.dto';

@ApiBearerAuth()
@ApiTags('Permissions')
@Controller({
  version: '1',
  path: 'permissions',
})
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Get()
  async findAll(@Query() query?: PaginationDTO) {
    const permissions = await this.permissionService.findAll(query);
    return SuccessResponseDto.getResponseObject(
      permissions,
      'Success in fetching Permissions',
      null,
    );
  }
}
