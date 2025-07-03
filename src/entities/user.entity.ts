import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Company } from './company.entity';
import { UserRole } from './user_roles.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { nullable: true })
  company: Company;

  @Column({ length: 100, unique: true, nullable: false })
  email: string;

  @Column({ length: 255, nullable: false })
  password: string;

  @Column({ length: 10, nullable: true })
  otp_code: string;

  @Column({ type: 'timestamp', nullable: true })
  otp_expiry: Date;

  @Column({ type: 'enum', enum: ['ACTIVE', 'INACTIVE'], nullable: true })
  status: 'ACTIVE' | 'INACTIVE';

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
