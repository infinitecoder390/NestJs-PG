import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from '../logger/logger.service';
import { CommonWebSocketGateway } from '../websocket/websocket.gateway';
import { KafkaService } from './kafka-consumer.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [KafkaService, LoggerService, CommonWebSocketGateway],
  exports: [KafkaService],
})
export class KafkaModule {}
