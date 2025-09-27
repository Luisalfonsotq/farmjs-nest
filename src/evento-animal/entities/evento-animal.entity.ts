// src/evento-animal/entities/evento-animal.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Animal } from '../../animal/entities/animal.entity';
import { TipoEventoAnimal } from '../../tipo-evento-animal/entities/tipo-evento-animal.entity';
import { Potrero } from '../../potrero/entities/potrero.entity';

@Entity('EventosAnimales')
export class EventoAnimal {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación ManyToOne con Animal
  @ManyToOne(() => Animal, animal => animal.eventos_animal)
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  @Column({ name: 'animal_id' })
  animal_id: number;

  // Relación ManyToOne con TipoEventoAnimal
  @ManyToOne(() => TipoEventoAnimal, tipo_evento => tipo_evento.eventos_animal)
  @JoinColumn({ name: 'tipo_evento_id' })
  tipo_evento: TipoEventoAnimal;

  @Column({ name: 'tipo_evento_id' })
  tipo_evento_id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'text', nullable: true })
  detalle: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valor_medida: number | null;

  // Relación ManyToOne con Potrero (anterior)
  @ManyToOne(() => Potrero, potrero => potrero.eventos_animal_anterior, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'potrero_anterior_id' })
  potrero_anterior: Potrero | null;

  @Column({ name: 'potrero_anterior_id', nullable: true })
  potrero_anterior_id: number | null;

  // Relación ManyToOne con Potrero (actual)
  @ManyToOne(() => Potrero, potrero => potrero.eventos_animal_actual, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'potrero_actual_id' })
  potrero_actual: Potrero | null;

  @Column({ name: 'potrero_actual_id', nullable: true })
  potrero_actual_id: number | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'eliminado_en' })
  eliminado_en: Date | null;
}