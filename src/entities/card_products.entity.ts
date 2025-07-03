
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Card } from './card.entity';

@Entity('card_products')
export class CardProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Card)
  card: Card;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  link: string;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
