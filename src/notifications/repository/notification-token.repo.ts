import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryImpl } from 'src/commons/repository/common.repo';
import { Repository } from 'typeorm';
import { NotificationToken } from '../entities/notification-token.entity';
import { NotificationTokenFilterQueryDto } from '../dto/notification-token-filter-query.dto';

@Injectable()
export class NotificationTokenRepository extends CommonRepositoryImpl<
  NotificationToken,
  NotificationTokenFilterQueryDto
> {
  constructor(
    @InjectRepository(NotificationToken)
    notificationTokenRepo: Repository<NotificationToken>,
  ) {
    super(notificationTokenRepo, new Logger(NotificationTokenRepository.name));
  }
}
