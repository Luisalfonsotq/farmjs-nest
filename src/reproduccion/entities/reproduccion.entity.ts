// src/reproduccion/entities/reproduccion.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Animal } from '../../animal/entities/animal.entity';

export enum TipoMonta {
  NATURAL = 'natural',
  INSEMINACION = 'inseminacion',
}

@Entity('reproducciones')
export class Reproduccion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Animal, animal => animal.reproducciones_madre, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animal_id' })
  madre: Animal;

  @Column({ name: 'animal_id' })
  animal_id: number;

  @Column({ type: 'date', nullable: true })
  fecha_celo: Date | null;

  @Column({ type: 'date', nullable: true })
  fecha_monta: Date | null;

  @Column({ type: 'enum', enum: TipoMonta, nullable: true })
  tipo_monta: TipoMonta | null;

  @ManyToOne(() => Animal, animal => animal.reproducciones_padre, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'toro_id' })
  padre: Animal | null;

  @Column({ name: 'toro_id', nullable: true })
  toro_id: number | null;

  @Column({ type: 'date', nullable: true })
  fecha_confirmacion_prenez: Date | null;

  @Column({ type: 'date', nullable: true })
  fecha_parto: Date | null;

  @Column({ type: 'int', nullable: true })
  crias_nacidas: number | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;

  @DeleteDateColumn()
  eliminado_en: Date | null;
}