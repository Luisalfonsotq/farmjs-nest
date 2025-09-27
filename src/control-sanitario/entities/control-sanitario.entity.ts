// src/control-sanitario/entities/control-sanitario.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Animal } from '../../animal/entities/animal.entity';
import { TipoControlSanitario } from '../../tipo-control-sanitario/entities/tipo-control-sanitario.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('controles_sanitarios')
export class ControlSanitario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Animal, animal => animal.controles_sanitarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  @Column({ name: 'animal_id' })
  animal_id: number;

  @ManyToOne(() => TipoControlSanitario, tipo_control => tipo_control.controles_sanitarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tipo_control_id' })
  tipo_control: TipoControlSanitario;

  @Column({ name: 'tipo_control_id' })
  tipo_control_id: number;

  @ManyToOne(() => Usuario, usuario => usuario.controles_sanitarios_realizados, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'veterinario_id' })
  veterinario: Usuario | null;

  @Column({ name: 'veterinario_id', nullable: true })
  veterinario_id: number | null;

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

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;

  @DeleteDateColumn()
  eliminado_en: Date | null;
}