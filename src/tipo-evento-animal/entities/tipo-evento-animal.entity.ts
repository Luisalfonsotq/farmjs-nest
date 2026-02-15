// src/tipo-evento-animal/entities/tipo-evento-animal.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { EventoAnimal } from '../../evento-animal/entities/evento-animal.entity';

@Entity('TiposEventosAnimales')
export class TipoEventoAnimal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string; // Ej: Nacimiento, Baja, Venta, Muerte, Cambio de Potrero, Pesaje

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'eliminado_en' })
  eliminado_en: Date | null;

  // Relación OneToMany con EventoAnimal
  @OneToMany(() => EventoAnimal, evento_animal => evento_animal.tipo_evento)
  eventos_animal: EventoAnimal[]; // <-- CAMBIO AQUÍ: Añadida la propiedad inversa
}