// src/control-sanitario/entities/control-sanitario.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn
} from 'typeorm';
import { Animal } from '../../animal/entities/animal.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('controles_sanitarios')
export class ControlSanitario {
  @PrimaryGeneratedColumn()
  id: number;

  // ─── Relación con Animal ──────────────────────────────────────────────────
  @ManyToOne(() => Animal, animal => animal.controles_sanitarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  @Column({ name: 'animal_id' })
  animal_id: number;

  // ─── Nombre directo del control (sin tabla auxiliar) ─────────────────────
  // Proviene de controlesSanitariosBase del frontend.
  // Ej: "Vacunación Fiebre Aftosa (FMD)", "Control de Garrapatas (Rhipicephalus)"
  @Column({ type: 'varchar', length: 255 })
  nombre_control: string;

  // Categoría del control: Vacunación, Control de parásitos, Reproductivo, etc.
  @Column({ type: 'varchar', length: 100, nullable: true })
  categoria_control: string | null;

  // ─── Veterinario responsable ──────────────────────────────────────────────
  @ManyToOne(() => Usuario, usuario => usuario.controles_sanitarios_realizados, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'veterinario_id' })
  veterinario: Usuario | null;

  @Column({ name: 'veterinario_id', nullable: true })
  veterinario_id: number | null;

  // ─── Datos del control ────────────────────────────────────────────────────
  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  medicamento: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  dosis: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  via_aplicacion: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costo: number | null;

  // ─── Timestamps ───────────────────────────────────────────────────────────
  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;

  @DeleteDateColumn()
  eliminado_en: Date | null;

  // ─── Propiedad virtual tipo_control ───────────────────────────────────────
  // El frontend existente espera: control.tipo_control?.nombre
  // Este campo NO está en la BD, se construye en el servicio antes de retornar.
  tipo_control?: { nombre: string; categoria?: string | null };
}