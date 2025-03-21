import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PaginationDTO } from 'src/commons/dtos/pagination.dto';
import { IJwt } from 'src/commons/interface/jwt.interface';
import { CommonMethods } from 'src/commons/utils/common-methods';
import { CreateNotificationTokenDto } from 'src/notifications/dto/create-notification-token.dto';
import { UpdateNotificationTokenDto } from 'src/notifications/dto/update-notification-token.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { In, Not } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repository/user.repo';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly notificationService: NotificationsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.validateIfExistingUserByPhone(createUserDto);
    await this.validateIfExistingUserByEntity(createUserDto);
    const encryptPassword = await CommonMethods.generatePasswordHash(
      createUserDto.password,
    );
    return await this.userRepo.createOne({
      ...createUserDto,
      password: encryptPassword as any,
    });
  }

  async findAll(params: PaginationDTO, projectionColumns?: string[]) {
    const { page, limit, keyword, sort, order, pageOff } = params;
    const searchColumns = ['name'];
    const sortingColumns = sort ? [sort] : undefined;
    const orderValue = order === 'ASC' ? 1 : -1;

    const users = await this.userRepo.findByQuery(
      { is_active: true, is_deleted: false, phone: Not(In(['9999999999'])) },
      page,
      limit,
      keyword,
      searchColumns,
      projectionColumns,
      sortingColumns,
      orderValue,
      pageOff,
    );

    return users;
  }

  async findOne(id: string) {
    return await this.userRepo.findOneById(id);
  }

  async enablePush(
    user_id: string,
    createNotificationDto: CreateNotificationTokenDto,
  ) {
    // const user = await this.userRepo.findOneById(user_id);
    // if (!user) {
    //   throw new BadRequestException(CommonMethods.getErrorMsg('USR_1013'));
    // }
    return await this.notificationService.acceptPushNotification(
      user_id,
      createNotificationDto,
    );
  }

  async disablePush(user_id: string, update_dto: UpdateNotificationTokenDto) {
    // const user = await this.userRepo.findOneById(user_id);
    // if (!user) {
    //   throw new BadRequestException(CommonMethods.getErrorMsg('USR_1013'));
    // }

    await this.notificationService.disablePushNotification(user_id, update_dto);
  }

  async getPushNotifications() {
    return await this.notificationService.getNotifications();
  }

  async loggedInUser(id: string & { projectionColumns?: string[] }) {
    const relations = ['userRoles', 'userRoles.role'];
    const user = await this.userRepo.findOneByQuery({ id }, relations);
    const {
      userRoles,
      is_active,
      is_deleted,
      created_at,
      updated_at,
      created_by,
      updated_by,
      password,
      deactivated_date,
      ...filteredData
    } = user;
    let role;
    let permissions;
    if (userRoles?.length) {
      const roleData = userRoles[0].role;
      permissions = roleData.permission_ids;
      role = roleData.id;
    }

    return {
      ...filteredData,
      role,
      permissions,
    };
  }

  async updatePassword(jwt: IJwt, updatePasswordDto: UpdatePasswordDto) {
    if (jwt) {
      const existingUser = await this.userRepo.findOneById(jwt.sub);
      if (!existingUser) {
        throw new BadRequestException(CommonMethods.getErrorMsg('USR_1013'));
      }
      const { currentPassword, newPassword } = updatePasswordDto;
      const { comparePasswordHash, generatePasswordHash } = CommonMethods;
      const isCurrentPasswordValid = await comparePasswordHash(
        currentPassword,
        existingUser.password,
      );
      if (!isCurrentPasswordValid) {
        throw new BadRequestException(CommonMethods.getErrorMsg('USR_1014'));
      }
      existingUser.password = await generatePasswordHash(newPassword);
      const updatedUser = await this.userRepo.updateOne(jwt.sub, existingUser);
      if (!updatedUser) {
        throw new BadRequestException(CommonMethods.getErrorMsg('USR_1015'));
      }
      return updatedUser;
    }
    return null;
  }

  private async validateIfExistingUserByPhone(createUserDto: CreateUserDto) {
    const existingUserPhone = await this.userRepo.findOneByQuery({
      phone: createUserDto.phone,
    });
    if (existingUserPhone) {
      throw new BadRequestException(CommonMethods.getErrorMsg('USR_1012'));
    }
  }

  private async validateIfExistingUserByEntity(createUserDto: CreateUserDto) {
    const existingUserEntity = await this.userRepo.findOneByQuery({
      entity_id: createUserDto.entity_id,
    });
    if (existingUserEntity) {
      throw new BadRequestException(CommonMethods.getErrorMsg('USR_1019'));
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException(CommonMethods.getErrorMsg('USR_1013'));
    }
    const updatedUser = await this.userRepo.updateOne(id, updateUserDto);
    if (!updatedUser) {
      throw new BadRequestException(CommonMethods.getErrorMsg('USR_1016'));
    }
    return updatedUser;
  }

  async remove(id: string) {
    await this.userRepo.softDeleteOneByQuery({ id });
    return { message: 'User deleted successfully' };
  }
}
