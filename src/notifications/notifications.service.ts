import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import * as path from 'path';
import { LoggerService } from 'src/commons/logger/logger.service';
import { CreateNotificationTokenDto } from './dto/create-notification-token.dto';
import { UpdateNotificationTokenDto } from './dto/update-notification-token.dto';
import { NotificationTokenStatus } from './entities/notification-token.entity';
import { NotificationStatus } from './entities/notification.entity';
import { NotificationTokenRepository } from './repository/notification-token.repo';
import { NotificationRepository } from './repository/notification.repo';

firebase.initializeApp({
  credential: firebase.credential.cert(
    path.resolve(__dirname, '..', 'config', 'firebase-service-account.json'),
  ),
});
@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly notificationTokenRepo: NotificationTokenRepository,
    private readonly loggerService: LoggerService,
  ) {}

  async acceptPushNotification(
    user_id: string,
    notification_dto: CreateNotificationTokenDto,
  ) {
    const { device_id } = notification_dto;

    this.loggerService.info(
      `acceptPushNotification: user_id: ${user_id}, device_id: ${device_id}`,
    );

    const existingRecord = await this.notificationTokenRepo.findOneByQuery({
      device_id,
      status: NotificationTokenStatus.ACTIVE,
    });

    let notificationToken;

    if (existingRecord) {
      this.loggerService.info(
        `Updating notification token for device_id: ${device_id}, user_id: ${user_id}`,
      );
      notificationToken = await this.notificationTokenRepo.updateOne(
        existingRecord.id,
        { ...notification_dto, user_id },
      );
    } else {
      this.loggerService.info(
        `Creating new notification token for device_id: ${device_id}, user_id: ${user_id}`,
      );
      notificationToken = await this.notificationTokenRepo.createOne({
        ...notification_dto,
        user_id,
        status: NotificationTokenStatus.ACTIVE,
      });
    }

    return notificationToken;
  }

  async disablePushNotification(
    user_id: string,
    update_dto: UpdateNotificationTokenDto,
  ) {
    try {
      this.loggerService.info(
        `Disabling push notification for user_id: ${user_id}, device_id: ${update_dto.device_id}`,
      );

      await this.notificationTokenRepo.updateOneByCondition(
        { user_id, device_id: update_dto.device_id },
        { status: NotificationTokenStatus.INACTIVE },
      );

      this.loggerService.info(
        `Push notification disabled for user_id: ${user_id}`,
      );
    } catch (error) {
      this.loggerService.error(
        `Error disabling push notification for user_id: ${user_id}: ${error.message}`,
      );
      throw error;
    }
  }

  async getNotifications() {
    this.loggerService.info(`Fetching all notifications`);
    return await this.notificationRepo.findAll();
  }

  async sendPush(
    to_user_id: string,
    title: string,
    body: string,
    visitor_id?: string,
    from_user_id?: string,
  ) {
    try {
      this.loggerService.info(
        `Sending push notification to user_id: ${to_user_id}`,
      );

      const notificationToken = await this.notificationTokenRepo.findOneByQuery(
        {
          user_id: to_user_id,
          status: NotificationTokenStatus.ACTIVE,
        },
      );

      if (notificationToken) {
        let createNotify: any = {
          notification_token_id: notificationToken.id,
          title,
          body,
          status: NotificationStatus.ACTIVE,
          to_user_id,
        };
        if (from_user_id) createNotify = { ...createNotify, from_user_id };
        if (visitor_id) createNotify = { ...createNotify, visitor_id };

        await this.notificationRepo.createOne(createNotify);

        this.loggerService.info(
          `Notification created for to_user_id: ${to_user_id}`,
        );

        await this.sendPushNotification(
          notificationToken.fcm_token,
          title,
          body,
          to_user_id,
          visitor_id,
        );
      }
    } catch (error) {
      this.loggerService.error(
        `Error sending push notification to user_id: ${to_user_id}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    entityId: string,
    visitor_id: string,
  ) {
    try {
      this.loggerService.info(
        `Sending FCM push notification to fcmToken: ${fcmToken}`,
      );
      let data: any = { visitor_id };
      if (!visitor_id && entityId) {
        data = { entityId };
      }

      const message = {
        notification: {
          title,
          body,
        },
        data,
        token: fcmToken,
      };

      const response = await firebase.messaging().send(message);
      this.loggerService.info(`Successfully sent message: ${response}`);
    } catch (error) {
      this.loggerService.error(
        `Error sending message to fcmToken: ${fcmToken}: ${error.message}`,
      );

      if (error.code === 'messaging/registration-token-not-registered') {
        this.loggerService.warn(`FCM token is no longer valid: ${fcmToken}`);
        await this.removeInvalidFcmToken(fcmToken);
      } else {
        this.loggerService.error(
          `Failed to send message due to another error: ${error.message}`,
        );
        throw error;
      }
    }
  }

  async removeInvalidFcmToken(fcmToken: string) {
    try {
      this.loggerService.info(`Removing invalid FCM token: ${fcmToken}`);
      // await this.notificationTokenRepo.deleteByCondition({
      //   fcm_token: fcmToken,
      // });
      await this.notificationTokenRepo.updateOneByCondition(
        { fcm_token: fcmToken },
        { status: NotificationTokenStatus.INACTIVE },
      );
      this.loggerService.info(`Invalid FCM token removed: ${fcmToken}`);
    } catch (error) {
      this.loggerService.error(
        `Error removing invalid FCM token: ${fcmToken}: ${error.message}`,
      );
      throw error;
    }
  }
}
