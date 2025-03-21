import { Module } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { CommonWebSocketGateway } from './websocket.gateway';

@Module({
  providers: [LoggerService, CommonWebSocketGateway],
  exports: [CommonWebSocketGateway],
})
export class WebSocketModule {}
