import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Card } from './card.entity';
import { User } from './user.entity';

@Entity('card_version_logs')
export class CardVersionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Card)
  card: Card;

  @Column({ type: 'int', nullable: false })
  version_number: number;

  @Column({ type: 'enum', enum: ['rollback'], nullable: false })
  action: 'rollback';

  @ManyToOne(() => User)
  performed_by: User;

  @CreateDateColumn()
  created_at: Date;
}