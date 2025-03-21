import { ClickHouseClient, createClient } from '@clickhouse/client';
import { Global, Module } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ClickHouseService } from './clickhouse.service';

@Global()
@Module({
  providers: [
    {
      provide: 'CLICKHOUSE_CLIENT',
      useFactory: (): ClickHouseClient => {
        return createClient({
          // url: 'http://default:clickhouse%40123@192.168.100.201:8123/default',
          // url: process.env.CLICK_HOUSE_URL,
          host: process.env.CLICK_HOUSE_HOST,
          username: process.env.CLICK_HOUSE_USER_NAME,
          password: process.env.CLICK_HOUSE_PASSWORD,
          database: process.env.CLICK_HOUSE_DB,
        });
      },
    },
    ClickHouseService,
    LoggerService,
  ],
  exports: ['CLICKHOUSE_CLIENT', ClickHouseService],
})
export class ClickHouseModule {}
