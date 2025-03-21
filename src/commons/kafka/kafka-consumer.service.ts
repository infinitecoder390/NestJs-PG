import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { LoggerService } from '../logger/logger.service';
import { CommonWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);

  constructor(
    private readonly loggerService: LoggerService,
    private readonly websocketGateway: CommonWebSocketGateway,
  ) {}
  private kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    // brokers: ['localhost:9092'],
  });
  private consumer: Consumer;

  async onModuleInit() {
    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID,
    });

    await this.consumer.connect();
    this.loggerService.info('Kafka consumer connected');
    // console.log('Kafka consumer connected');

    await this.consumer.subscribe({
      topic: process.env.KAFKA_TOPIC,
      fromBeginning: false,
    });
    // await this.consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

    await this.consumer.run({
      // Enable auto-commit
      autoCommit: true, // Kafka will auto-commit offsets
      // autoCommitInterval: 5000, // Interval in ms to auto-commit, optional
      // autoCommitThreshold: 100, // Number of messages after which auto-commit happens, optional
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value?.toString();
        let jsonMessage;

        try {
          // Attempt to parse the message
          jsonMessage = JSON.parse(value);

          // Log the successfully received JSON message
          this.loggerService.info(
            `Received JSON message from topic ${topic}: ${JSON.stringify(jsonMessage)}`,
          );
        } catch (error) {
          this.loggerService.error(
            `Error parsing JSON message: ${error.stack}`,
          );
          this.loggerService.error(`Received raw message: ${value}`);

          return;
        }

        try {
          this.loggerService.info(`kafka msg ${JSON.stringify(jsonMessage)}`);
        } catch (processingError) {
          this.loggerService.error(
            `Error processing message: ${processingError.stack}`,
          );
          return;
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    // console.log('Kafka consumer disconnected');
    this.loggerService.info('Kafka consumer disconnected');
  }
}
