import { PartialType } from '@nestjs/swagger';
import { CreateNotificationTokenDto } from './create-notification-token.dto';

export class UpdateNotificationTokenDto extends PartialType(
  CreateNotificationTokenDto,
) {}
