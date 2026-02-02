import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserPersistence } from '../../../auth/infraestructure/entities/user.persistence.entity';

@Entity('images')
export class ImagePersistence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserPersistence)
  @JoinColumn({ name: 'userId' })
  user: UserPersistence;

  @Column()
  originalFileName: string;

  @Column()
  storedFileName: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column('int')
  size: number;

  @Column('int')
  width: number;

  @Column('int')
  height: number;

  @Column()
  format: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
