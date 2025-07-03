import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Card } from './card.entity';

@Entity('card_contacts')
export class CardContact {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Card)
  card: Card;

  @Column({
    type: 'enum',
    enum: [
      'phone',
      'email',
      'website',
      'address',
      'zalo',
      'facebook',
      'linkedin',
      'bank',
    ],
    nullable: false,
  })
  type:
    | 'phone'
    | 'email'
    | 'website'
    | 'address'
    | 'zalo'
    | 'facebook'
    | 'linkedin'
    | 'bank';

  @Column({ length: 255, nullable: false })
  value: string;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
