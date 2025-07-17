// src/control-sanitario/entities/control-sanitario.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Animal } from '../../animal/entities/animal.entity';
import { TipoControlSanitario } from '../../tipo-control-sanitario/entities/tipo-control-sanitario.entity';
import { Usuario } from '../../usuario/entities/usuario.entity'; // Usuario con rol veterinario

@Entity('ControlSanitario')
export class ControlSanitario {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación ManyToOne con Animal
  @ManyToOne(() => Animal, animal => animal.controles_sanitarios)
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  @Column({ name: 'animal_id' })
  animal_id: number;

  // Relación ManyToOne con TipoControlSanitario
  @ManyToOne(() => TipoControlSanitario, tipo_control => tipo_control.controles_sanitarios)
  @JoinColumn({ name: 'tipo_control_id' })
  tipo_control: TipoControlSanitario;

  @Column({ name: 'tipo_control_id' })
  tipo_control_id: number;

  // Relación ManyToOne con Usuario (veterinario)
  @ManyToOne(() => Usuario, usuario => usuario.controles_sanitarios_realizados)
  @JoinColumn({ name: 'veterinario_id' })
  veterinario: Usuario;

  @Column({ name: 'veterinario_id' })
  veterinario_id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  medicamento: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  dosis: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  via_aplicacion: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costo: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}