import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CommonMethods } from 'src/commons/utils/common-methods';
import { NotificationTokenStatus } from '../entities/notification-token.entity';

export class CreateNotificationTokenDto {
  @ApiProperty({
    example: 'ios',
    description: 'Type of device (e.g., ios, android)',
  })
  @IsString({ message: CommonMethods.getErrorMsgCombinedString('FCM_1001') })
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('FCM_1002') })
  device_type: string;

  @ApiProperty({
    example: 'device123',
    description: 'Unique identifier for the device',
  })
  @IsString({ message: CommonMethods.getErrorMsgCombinedString('FCM_1003') })
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('FCM_1004') })
  device_id: string;

  @ApiProperty({
    example: 'fcm_token_example',
    description: 'Firebase Cloud Messaging token for sending notifications',
  })
  @IsString({ message: CommonMethods.getErrorMsgCombinedString('FCM_1005') })
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('FCM_1006') })
  fcm_token: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Status of the notification token, default is ACTIVE',
    required: false,
    enum: NotificationTokenStatus,
  })
  @IsEnum(NotificationTokenStatus, {
    message: CommonMethods.getErrorMsgCombinedString('FCM_1007'),
  })
  @IsOptional()
  status?: NotificationTokenStatus;
}
