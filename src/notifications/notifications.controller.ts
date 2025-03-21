import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // @Post('send')
  // async sendNotification(
  //   @Body() createNotificationDto: CreateNotificationTokenDto,
  // ) {
  //   const { token, title, body } = createNotificationDto;
  //   return this.notificationsService.sendPush(token, title, body);
  // }
}
