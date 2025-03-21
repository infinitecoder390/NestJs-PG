import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { User } from './entities/user.entity';
import { UserRepository } from './repository/user.repo';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), NotificationsModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
