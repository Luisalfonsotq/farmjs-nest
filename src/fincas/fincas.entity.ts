import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity'; // Ajusta esta ruta según tu estructura

@Entity('finca')
export class Finca {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ubicacion: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'propietario_id' })
  propietario: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tamano_ha: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}
