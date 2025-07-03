import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Card } from './card.entity';

@Entity('card_images')
export class CardImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Card)
  card: Card;

  @Column({ length: 255, nullable: false })
  image_url: string;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}