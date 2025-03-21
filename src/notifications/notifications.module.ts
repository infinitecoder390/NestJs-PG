import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from 'src/commons/logger/logger.service';
import { NotificationToken } from './entities/notification-token.entity';
import { Notifications } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationTokenRepository } from './repository/notification-token.repo';
import { NotificationRepository } from './repository/notification.repo';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationToken, Notifications])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRepository,
    LoggerService,
    NotificationTokenRepository,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
