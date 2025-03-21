import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CommonRepositoryImpl } from 'src/commons/repository/common.repo';
import { UserFilterQueryDto } from '../dto/user-filter-query.dto';

@Injectable()
export class UserRepository extends CommonRepositoryImpl<
  User,
  UserFilterQueryDto
> {
  constructor(
    @InjectRepository(User)
    UserRepo: Repository<User>,
  ) {
    super(UserRepo, new Logger(UserRepository.name));
  }
}
