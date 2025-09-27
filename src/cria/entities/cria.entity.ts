// src/cria/entities/cria.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Animal } from '../../animal/entities/animal.entity';

@Entity('crias')
export class Cria {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación OneToOne con Animal (la cría en sí)
  @OneToOne(() => Animal, animal => animal.crias, { onDelete: 'CASCADE' }) // Añadir onDelete
  @JoinColumn({ name: 'animal_id' })
  cria_animal: Animal;

  @Column({ name: 'animal_id', unique: true })
  animal_id: number;

  // Relación ManyToOne con Animal (madre)
  @ManyToOne(() => Animal, animal => animal.crias_como_madre, { onDelete: 'RESTRICT' }) // Puedes ajustar el onDelete
  @JoinColumn({ name: 'madre_id' })
  madre: Animal;

  @Column({ name: 'madre_id' })
  madre_id: number;

  // Relación ManyToOne con Animal (padre, opcional)
  @ManyToOne(() => Animal, animal => animal.crias_como_padre, { nullable: true, onDelete: 'SET NULL' }) // <-- CAMBIO AQUÍ: nullable: true
  @JoinColumn({ name: 'padre_id' })
  padre: Animal | null; // <-- CAMBIO AQUÍ: Puede ser nulo

  @Column({ name: 'padre_id', nullable: true }) // <-- CAMBIO AQUÍ: nullable: true
  padre_id: number | null; // <-- CAMBIO AQUÍ: Puede ser nulo

  @Column({ type: 'date', name: 'fecha_nacimiento' }) // Duplicado de Animal.fecha_nacimiento para simplicidad
  fecha_nacimiento: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'eliminado_en' })
  eliminado_en: Date | null;
}