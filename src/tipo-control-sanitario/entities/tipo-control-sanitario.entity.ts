// src/tipo-control-sanitario/entities/tipo-control-sanitario.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ControlSanitario } from '../../control-sanitario/entities/control-sanitario.entity'; 

@Entity('TiposControlesSanitarios')
export class TipoControlSanitario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: false })
  aplica_a_sexo: boolean;

  @Column({ type: 'boolean', default: false })
  requiere_medicamento: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Relación OneToMany con ControlSanitario
  @OneToMany(() => ControlSanitario, control_sanitario => control_sanitario.tipo_control)
  controles_sanitarios: ControlSanitario[];
}