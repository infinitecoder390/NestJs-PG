import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDTO } from 'src/commons/dtos/pagination.dto';
import { CommonMethods } from 'src/commons/utils/common-methods';
import { RolesRepository } from 'src/roles/repository/roles.repo';
import { UserRepository } from 'src/user/repository/user.repo';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRolesRepository } from './repository/user-roles.repo';

@Injectable()
export class UserRolesService {
  constructor(
    private readonly userRoleRepository: UserRolesRepository,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RolesRepository,
  ) {}

  async assignUserRole(assignUserRoleDto: CreateUserRoleDto) {
    const { user_id, role_id } = assignUserRoleDto;

    const existingUserRole = await this.userRoleRepository.findOneByQuery({
      user_id,
      is_active: true,
      is_deleted: false,
    });

    if (existingUserRole) {
      throw new BadRequestException(CommonMethods.getErrorMsg('usr_role_1004'));
    }

    await this.validateUserAndRole(user_id, role_id);

    const createUserRoleData = {
      user_id,
      role_id,
      permission_entity: {
        user_id,
      },
    };

    const userRole =
      await this.userRoleRepository.createOne(createUserRoleData);
    return userRole;
  }

  async getUserRoles(user_id: string) {
    return await this.userRoleRepository.findByQuery({ user_id });
  }

  async findAll(params: PaginationDTO) {
    const { page, limit, keyword, sort, order, pageOff } = params;
    const sortingColumns = sort ? [sort] : undefined;
    const orderValue = order === 'ASC' ? 1 : -1;

    const users = await this.userRoleRepository.findByQuery(
      { is_active: true, is_deleted: false },
      page,
      limit,
      keyword,
      undefined,
      undefined,
      sortingColumns,
      orderValue,
      pageOff,
    );

    return users;
  }

  async updateUserRole(updateUserRoleDto: UpdateUserRoleDto) {
    const { user_id, role_id } = updateUserRoleDto;

    const existingUserRole = await this.userRoleRepository.findOneByQuery({
      user_id,
      is_active: true,
      is_deleted: false,
    });

    if (!existingUserRole) {
      throw new NotFoundException('User role not found');
    }

    await this.validateUserAndRole(user_id, role_id);
    const updatedUserRole = await this.userRoleRepository.updateOne(
      existingUserRole.id,
      updateUserRoleDto,
    );

    return updatedUserRole;
  }

  async remove(id: string) {
    await this.userRoleRepository.softDeleteOneByQuery({ id });
    return { message: 'User Role deleted successfully' };
  }

  private async validateUserAndRole(user_id: string, role_id: string) {
    const [user, role] = await Promise.all([
      this.userRepository.findOneById(user_id),
      this.roleRepository.findOneById(role_id),
    ]);

    if (!user || !role) {
      throw new NotFoundException(`${!user ? 'User' : 'Role'} not found`);
    }

    return { user, role };
  }
}
