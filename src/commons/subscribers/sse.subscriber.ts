import { Injectable } from '@nestjs/common';
import {
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { CommonEntity } from '../models/base.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class SseSubscriber implements EntitySubscriberInterface<CommonEntity> {
  constructor(private readonly sseService: SseService) {}

  async afterInsert(event: InsertEvent<CommonEntity>) {
    const entityName = event.metadata.targetName;

    // Check if the entity is either Attendance or Visitor
    if (entityName === 'Attendance' || entityName === 'Visitor') {
      this.sseService.sendEvent({
        action: 'INSERT',
        entityName: entityName,
      });
    }
  }

  async afterUpdate(event: UpdateEvent<CommonEntity>) {
    const entityName = event.metadata.targetName;

    // Check if the entity is either Attendance or Visitor
    if (entityName === 'Attendance' || entityName === 'Visitor') {
      this.sseService.sendEvent({
        action: 'UPDATE',
        entityName: event.metadata.targetName,
      });
    }
  }

  async afterRemove(event: RemoveEvent<CommonEntity>) {
    const entityName = event.metadata.targetName;

    if (entityName === 'Attendance' || entityName === 'Visitor') {
      this.sseService.sendEvent({
        action: 'DELETE',
        entityName: event.metadata.targetName,
      });
    }
  }
}
