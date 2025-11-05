// src/potrero/entities/potrero.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { Finca } from '../../finca/entities/finca.entity';
import { Animal } from '../../animal/entities/animal.entity';
import { EventoAnimal } from 'src/evento-animal/entities/evento-animal.entity';

@Entity('Potreros')
export class Potrero {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tamano_ha: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tipo_pasto: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    comment: 'Latitud de la ubicación del potrero'
  })
  latitud: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    comment: 'Longitud de la ubicación del potrero'
  })
  longitud: number | null;

  // Relación ManyToOne con Finca
  @ManyToOne(() => Finca, finca => finca.potreros)
  @JoinColumn({ name: 'finca_id' })
  finca: Finca;

  @Column({ name: 'finca_id' }) // Columna FK para referenciar en DTOs y lógica
  finca_id: number;

  @Column({ type: 'timestamp', nullable: true })
  ocupado_desde: Date;

  @Column({ type: 'timestamp', nullable: true })
  ocupado_hasta: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true }) // Cambia @Column por @DeleteDateColumn
  eliminado_en: Date | null;

  // Relación OneToMany con Animal
  @OneToMany(() => Animal, animal => animal.potrero)
  animales: Animal[];

  @OneToMany(() => EventoAnimal, evento => evento.potrero_anterior)
  eventos_animal_anterior: EventoAnimal[];

  @OneToMany(() => EventoAnimal, evento => evento.potrero_actual)
  eventos_animal_actual: EventoAnimal[];
}