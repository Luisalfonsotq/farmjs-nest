// src/control-sanitario/entities/control-sanitario.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Animal } from '../../animal/entities/animal.entity';
import { TipoControlSanitario } from '../../tipo-control-sanitario/entities/tipo-control-sanitario.entity';
import { Usuario } from '../../usuario/entities/usuario.entity'; // Asegúrate de la ruta de importación

export enum TipoTratamiento {
  VACUNACION = 'Vacunación',
  DESPARASITACION = 'Desparasitación',
  ANTIBIOTICO = 'Antibiótico',
  VITAMINAS = 'Vitaminas',
  CIRUGIA = 'Cirugía',
  OTRO = 'Otro',
}

export enum TipoEnfermedad {
  FIEBRE_AFTOSA = 'Fiebre Aftosa',
  BRUCELOSIS = 'Brucelosis',
  MASTITIS = 'Mastitis',
  PARASITOSIS = 'Parasitosis',
  RESPIRATORIA = 'Respiratoria',
  DIGESTIVA = 'Digestiva',
  OTRA = 'Otra',
}

@Entity('ControlesSanitarios')
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

  // 🐮 ⬅️ ¡CAMBIO CLAVE AQUÍ!
  // Asegúrate de que el nombre de la propiedad inversa ('controles_sanitarios_realizados')
  // COINCIDA EXACTAMENTE con el definido en la entidad 'Usuario'.
  @ManyToOne(() => Usuario, usuario => usuario.controles_sanitarios_realizados, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'veterinario_id' })
  veterinario: Usuario | null;

  @Column({ name: 'veterinario_id', nullable: true })
  veterinario_id: number | null;

  @Column({ type: 'date', name: 'fecha_control' })
  fecha_control: Date;

  @Column({ type: 'enum', enum: TipoTratamiento, nullable: true, name: 'tipo_tratamiento' })
  tipo_tratamiento: TipoTratamiento | null;

  @Column({ type: 'enum', enum: TipoEnfermedad, nullable: true, name: 'tipo_enfermedad' })
  tipo_enfermedad: TipoEnfermedad | null;

  @Column({ type: 'text', nullable: true })
  medicamento_dosis: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleted_at: Date | null;
}