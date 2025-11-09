// src/invitacion/entities/invitacion.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Finca } from '../../finca/entities/finca.entity';
import { RolUsuario } from '../../usuario/entities/usuario.entity';

export enum EstadoInvitacion {
  PENDIENTE = 'Pendiente',
  ACEPTADA = 'Aceptada',
  RECHAZADA = 'Rechazada',
  EXPIRADA = 'Expirada'
}

@Entity('invitaciones')
export class Invitacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'enum', enum: RolUsuario, nullable: false })
  rol: RolUsuario;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  token: string;

  @Column({ type: 'enum', enum: EstadoInvitacion, default: EstadoInvitacion.PENDIENTE })
  estado: EstadoInvitacion;

  @Column({ type: 'timestamp', nullable: false })
  expira_en: Date;

  @ManyToOne(() => Finca, { eager: true })
  @JoinColumn({ name: 'finca_id' })
  finca: Finca;

  @Column({ name: 'finca_id' })
  finca_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}