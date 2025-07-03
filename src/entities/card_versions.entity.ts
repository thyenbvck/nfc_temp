import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Card } from './card.entity';
import { User } from './user.entity';

@Entity('card_versions')
export class CardVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Card)
  card: Card;

  @Column({ type: 'int', nullable: false })
  version_number: number;

  @Column({ type: 'json', nullable: false })
  data: object;

  @ManyToOne(() => User)
  created_by: User;

  @CreateDateColumn()
  created_at: Date;
}