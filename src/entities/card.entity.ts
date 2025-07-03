import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { CardImage } from './card_images.entity';
import { CardContact } from './card_contacts.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Company, { nullable: true })
  company: Company;

  @OneToMany(() => CardImage, (image) => image.card)
  images: CardImage[];

  @OneToMany(() => CardContact, (contact) => contact.card)
  contacts: CardContact[];

  @Column({ length: 50, nullable: false })
  name: string;

  @Column({ length: 100, nullable: true })
  title: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ length: 255, nullable: true })
  background: string;

  @Column({ type: 'json', nullable: true })
  color_scheme: object;

  @Column({ length: 255, nullable: true })
  logo: string;

  @Column({ length: 255, nullable: true })
  qr_code: string;

  @Column({ type: 'json', nullable: true })
  custom_fields: object;

  @Column({ type: 'boolean', default: false })
  is_private: boolean;

  @Column({ type: 'int', nullable: true })
  max_version: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';

  @Column({ type: 'int', nullable: true })
  view_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
