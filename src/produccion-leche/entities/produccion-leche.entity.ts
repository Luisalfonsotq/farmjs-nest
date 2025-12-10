import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Animal } from '../../animal/entities/animal.entity';
import { Finca } from '../../finca/entities/finca.entity';

export enum JornadaOrdeño {
  MANANA = 'manana',
  TARDE = 'tarde',
}

@Entity('produccion_leche')
export class ProduccionLeche {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'Cantidad en litros' })
  cantidad: number;

  @Column({ type: 'enum', enum: JornadaOrdeño, nullable: true })
  jornada: JornadaOrdeño | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  // --- Relaciones ---

  @ManyToOne(() => Animal, (animal) => animal.producciones_leche, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  @Column({ name: 'animal_id' })
  animal_id: number;

  @ManyToOne(() => Finca, (finca) => finca.producciones_leche, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'finca_id' })
  finca: Finca;

  @Column({ name: 'finca_id' })
  finca_id: number;

  // --- Timestamps ---
  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;

  @DeleteDateColumn()
  eliminado_en: Date | null;
}
