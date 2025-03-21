import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestContextModule } from 'nestjs-request-context';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { ClickHouseModule } from './commons/clickhouse/clickhouse.module';
import { KafkaModule } from './commons/kafka/kafka.module';
import { SseModule } from './commons/sse/sse.module';
import { WebSocketModule } from './commons/websocket/websocket.module';
import { AppDataSource } from './db/database.config';
import { NotificationsModule } from './notifications/notifications.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RoleModule } from './roles/roles.module';
import { UserRolesModule } from './user-roles/user-roles.module';
@Module({
  imports: [
    RequestContextModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    WebSocketModule,
    WebSocketModule,
    ClickHouseModule,
    AuthModule,
    PermissionsModule,
    RoleModule,
    UserRolesModule,
    NotificationsModule,
    AuditModule,
    KafkaModule,
    SseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
