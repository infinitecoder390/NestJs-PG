import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationDTO } from 'src/commons/dtos/pagination.dto';
import { SuccessResponseDto } from 'src/commons/dtos/success-response.dto';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRolesService } from './user-roles.service';

@ApiBearerAuth()
@ApiTags('UserRoles')
@Controller({
  version: '1',
  path: 'user-roles',
})
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post('assign')
  @HttpCode(HttpStatus.OK)
  async assignUserRole(@Body() assignUserRoleDto: CreateUserRoleDto) {
    const assignedRole =
      await this.userRolesService.assignUserRole(assignUserRoleDto);
    return SuccessResponseDto.getResponseObject(
      assignedRole,
      'Success in assigning role to user',
      null,
    );
  }

  @Get()
  async findAll(@Query() queryParams: PaginationDTO) {
    const userRoles = await this.userRolesService.findAll(queryParams);
    return SuccessResponseDto.getResponseObject(
      userRoles,
      'Success in fetching user roles',
      null,
    );
  }

  @Get(':user_id')
  async getUserRoles(@Param('user_id') user_id: string) {
    const userRoles = await this.userRolesService.getUserRoles(user_id);
    return SuccessResponseDto.getResponseObject(
      userRoles,
      'Success in fetching user roles',
      null,
      true,
    );
  }

  @Patch(':user_id')
  @HttpCode(HttpStatus.OK)
  async updateUserRoles(
    @Param('user_id') user_id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const updatedRole = await this.userRolesService.updateUserRole({
      user_id,
      ...updateUserRoleDto,
    });
    return SuccessResponseDto.getResponseObject(
      updatedRole,
      'Success in updating user roles',
      null,
      true,
    );
  }

  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // async removeUserRole(@Param('id') id: string) {
  //   await this.userRolesService.remove(id);
  //   return SuccessResponseDto.getResponseObject(
  //     null,
  //     `User role with ID ${id} has been deleted.`,
  //     null,
  //   );
  // }
}
