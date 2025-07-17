// src/reproduccion/entities/reproduccion.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Animal } from '../../animal/entities/animal.entity';

export enum TipoMonta {
  NATURAL = 'Natural',
  INSEMINACION = 'Inseminacion',
}

@Entity('Reproduccion')
export class Reproduccion {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación ManyToOne con Animal (madre)
  @ManyToOne(() => Animal, animal => animal.reproducciones_madre, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'animal_id' })
  madre: Animal;

  @Column({ name: 'animal_id' })
  animal_id: number;

  @Column({ type: 'date', nullable: true, name: 'fecha_celo' })
  fecha_celo: Date | null;

  @Column({ type: 'date', nullable: true, name: 'fecha_monta' })
  fecha_monta: Date | null;

  @Column({ type: 'enum', enum: TipoMonta, nullable: true, name: 'tipo_monta' })
  tipo_monta: TipoMonta | null;

  // Relación ManyToOne con Animal (padre/toro)
  @ManyToOne(() => Animal, animal => animal.reproducciones_padre, { nullable: true, onDelete: 'SET NULL' }) // <-- CAMBIO AQUÍ: nullable: true
  @JoinColumn({ name: 'toro_id' })
  padre: Animal | null; // <-- CAMBIO AQUÍ: Puede ser nulo

  @Column({ name: 'toro_id', nullable: true }) // <-- CAMBIO AQUÍ: nullable: true
  toro_id: number | null; // <-- CAMBIO AQUÍ: Puede ser nulo

  @Column({ type: 'date', nullable: true, name: 'fecha_confirmacion_prenez' })
  fecha_confirmacion_prenez: Date | null;

  @Column({ type: 'date', nullable: true, name: 'fecha_parto' })
  fecha_parto: Date | null;

  @Column({ type: 'int', default: 0, name: 'crias_nacidas' })
  crias_nacidas: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleted_at: Date | null;
}