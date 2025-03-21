import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JWT } from 'src/commons/decorators/jwt.deorator';
import { PaginationDTO } from 'src/commons/dtos/pagination.dto';
import { SuccessResponseDto } from 'src/commons/dtos/success-response.dto';
import { TransformInterceptor } from 'src/commons/interceptors/transform.interceptor';
import { IJwt } from 'src/commons/interface/jwt.interface';
import { validateAndTransformDto } from 'src/commons/utils/validation-utils';
import { CreateNotificationTokenDto } from 'src/notifications/dto/create-notification-token.dto';
import { UpdateNotificationTokenDto } from 'src/notifications/dto/update-notification-token.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('Users')
@Controller({
  version: '1',
  path: 'users',
})
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return SuccessResponseDto.getResponseObject(
      user,
      'Success in creating User',
      null,
    );
  }

  @Get()
  async findAll(@Query() queryParams: PaginationDTO, @JWT() jwt: IJwt) {
    const projectionColumns = [
      'id',
      'name',
      'created_by',
      'updated_by',
      'entity_id',
      'name',
      'designation',
      'phone',
      'email',
      'image',
      'dept',
    ];
    // if (jwt.isAdmin || jwt.permission_ids.includes('FRONT_DESK')) {
    const users = await this.userService.findAll(
      queryParams,
      projectionColumns,
    );
    // } else {
    //   users = await this.userService.findOne(jwt.sub);
    // }

    return SuccessResponseDto.getResponseObject(
      users,
      'Success in fetching Users',
      null,
      queryParams?.pageOff,
    );
  }

  @Get('profile')
  async profile(@JWT() jwt: IJwt) {
    const user = await this.userService.loggedInUser(jwt.sub);
    return SuccessResponseDto.getResponseObject(
      user,
      'Success in fetching User',
      null,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return SuccessResponseDto.getFilledResponseObjectAllArgs(
      user,
      'Success in fetching User',
      null,
    );
  }

  @Patch('password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @JWT() jwt: IJwt,
  ) {
    await validateAndTransformDto(UpdatePasswordDto, updatePasswordDto);
    const updatedUser = await this.userService.updatePassword(
      jwt,
      updatePasswordDto,
    );
    return SuccessResponseDto.getResponseObject(
      updatedUser,
      'Success in updating User password',
      null,
    );
  }

  // @Patch(':user_id/push/enable')
  @Post('push/enable')
  async enablePush(
    @Body() createNotificationDto: CreateNotificationTokenDto,
    @JWT() jwt: IJwt,
  ) {
    const user = await this.userService.enablePush(
      jwt.sub,
      createNotificationDto,
    );
    return SuccessResponseDto.getResponseObject(
      user,
      'Success in push enable',
      null,
    );
  }

  @Post('push/disable')
  async disablePush(
    @JWT() jwt: IJwt,
    @Body() updateNotificationDto: UpdateNotificationTokenDto,
  ) {
    const user = await this.userService.disablePush(
      jwt.sub,
      updateNotificationDto,
    );
    return SuccessResponseDto.getResponseObject(
      user,
      'Success in push disable',
      null,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await validateAndTransformDto(UpdateUserDto, updateUserDto);
    // Remove the password field if it exists
    if ('password' in updateUserDto) {
      delete updateUserDto['password'];
    }
    const updatedUser = await this.userService.update(user_id, updateUserDto);
    return SuccessResponseDto.getFilledResponseObjectAllArgs(
      updatedUser,
      'Success in updating User',
      null,
    );
  }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   await this.userService.remove(id);
  //   return SuccessResponseDto.getFilledResponseObjectAllArgs(
  //     null,
  //     `User with ID ${id} has been deleted.`,
  //     null,
  //   );
  // }
}
