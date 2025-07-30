// src/reproduccion/entities/reproduccion.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Animal } from '../../animal/entities/animal.entity';

export enum TipoMonta {
  NATURAL = 'Natural',
  INSEMINACION_ARTIFICIAL = 'Inseminación Artificial',
  TRANSFERENCIA_EMBRIONES = 'Transferencia de Embriones',
}

@Entity('Reproducciones') // Nombre de la tabla en la base de datos
export class Reproduccion {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación ManyToOne con Animal (madre)
  @ManyToOne(() => Animal, animal => animal.reproducciones_madre, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'madre_id' }) // 🐮 ⬅️ Clave foránea para la madre
  madre: Animal;

  @Column({ name: 'madre_id' }) // 🐮 ⬅️ Columna ID para la madre
  madre_id: number;

  // Relación ManyToOne con Animal (padre, opcional)
  @ManyToOne(() => Animal, animal => animal.reproducciones_padre, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'padre_id' }) // 🐮 ⬅️ Clave foránea para el padre
  padre: Animal | null;

  @Column({ name: 'padre_id', nullable: true }) // 🐮 ⬅️ Columna ID para el padre
  padre_id: number | null;

  @Column({ type: 'date', name: 'fecha_monta_ia' }) // 🐮 ⬅️ Nombre de columna actualizado
  fecha_monta_ia: Date;

  @Column({ type: 'enum', enum: TipoMonta, nullable: true, name: 'tipo_monta' })
  tipo_monta: TipoMonta | null;

  @Column({ type: 'date', name: 'fecha_diagnostico_gestacion', nullable: true }) // 🐮 ⬅️ Nueva columna
  fecha_diagnostico_gestacion: Date | null;

  @Column({ type: 'boolean', name: 'resultado_gestacion', nullable: true }) // 🐮 ⬅️ Nueva columna
  resultado_gestacion: boolean | null; // True = preñada, False = no preñada

  @Column({ type: 'date', name: 'fecha_parto', nullable: true })
  fecha_parto: Date | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  // --- Columnas de control de tiempo ---
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleted_at: Date | null;
}