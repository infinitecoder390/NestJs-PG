import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryImpl } from 'src/commons/repository/common.repo';
import { Repository } from 'typeorm';
import { NotificationFilterQueryDto } from '../dto/notification-filter-query.dto';
import { Notifications } from '../entities/notification.entity';

@Injectable()
export class NotificationRepository extends CommonRepositoryImpl<
  Notifications,
  NotificationFilterQueryDto
> {
  constructor(
    @InjectRepository(Notifications)
    notificationRepo: Repository<Notifications>,
  ) {
    super(notificationRepo, new Logger(NotificationRepository.name));
  }
}
