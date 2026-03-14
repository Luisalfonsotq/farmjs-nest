import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Finca } from '../../finca/entities/finca.entity';

export enum AccionAuditoria {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  REPORT_GENERATION = 'REPORT_GENERATION'
}

@Entity('auditoria')
export class Auditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'int', nullable: true })
  usuario_id: number | null;

  @ManyToOne(() => Finca, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'finca_id' })
  finca: Finca | null;

  @Column({ type: 'int', nullable: true })
  finca_id: number;

  @Column({ type: 'enum', enum: AccionAuditoria })
  accion: AccionAuditoria;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entidad: string;

  @Column({ type: 'int', nullable: true })
  entidad_id: number | null;

  @Column({ type: 'json', nullable: true })
  detalles: any;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @CreateDateColumn({ name: 'fecha' })
  fecha: Date;
}
