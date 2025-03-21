import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggerService } from '../logger/logger.service';

@WebSocketGateway({ cors: true })
export class CommonWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() io: Server;
  constructor(private readonly loggerService: LoggerService) {}

  afterInit() {
    this.loggerService.info('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    const { sockets } = this.io.sockets;
    this.loggerService.info(`Client connected: ${client.id}`);
    this.loggerService.info(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: Socket) {
    this.loggerService.info(`Client disconnected: ${client.id}`);
  }

  // Method to send messages to all clients
  broadcastToClients(event: string, message: any) {
    try {
      this.io.emit(event, message);
      this.loggerService.info(
        `Broadcasted message: ${message} to event: ${event}`,
      );
    } catch (error) {
      this.loggerService.error(`Failed to broadcast message: ${error.message}`);
    }
  }
}
