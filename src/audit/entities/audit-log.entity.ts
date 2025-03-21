import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  action_time: Date;

  @Column({ type: 'varchar' })
  action_type: string; // 'INSERT', 'UPDATE', 'DELETE'

  @Column({ type: 'varchar' })
  entity_name: string;

  @Column({ type: 'jsonb', nullable: true })
  old_value: any;

  @Column({ type: 'jsonb', nullable: true })
  new_value: any;

  @Column({ type: 'varchar', nullable: true })
  performed_by: string;
}
