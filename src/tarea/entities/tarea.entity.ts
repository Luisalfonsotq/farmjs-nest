// src/tarea/entities/tarea.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Finca } from '../../finca/entities/finca.entity';
import { Potrero } from '../../potrero/entities/potrero.entity';

export enum EstadoTarea {
    PENDIENTE = 'pendiente',
    EN_CURSO = 'en_curso',
    COMPLETADA = 'completada',
    VENCIDA = 'vencida',
    CANCELADA = 'cancelada',
}

export enum PrioridadTarea {
    BAJA = 'baja',
    MEDIA = 'media',
    ALTA = 'alta',
    URGENTE = 'urgente',
}

export enum CategoriaTarea {
    ALIMENTACION = 'alimentacion',
    LIMPIEZA = 'limpieza',
    MOVIMIENTO_GANADO = 'movimiento_ganado',
    MANTENIMIENTO = 'mantenimiento',
    SANIDAD = 'sanidad',
    REVISION = 'revision',
    OTRO = 'otro',
}

@Entity('tareas')
export class Tarea {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    titulo: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string | null;

    @Column({
        type: 'enum',
        enum: EstadoTarea,
        default: EstadoTarea.PENDIENTE,
    })
    estado: EstadoTarea;

    @Column({
        type: 'enum',
        enum: PrioridadTarea,
        default: PrioridadTarea.MEDIA,
    })
    prioridad: PrioridadTarea;

    @Column({
        type: 'enum',
        enum: CategoriaTarea,
        default: CategoriaTarea.OTRO,
    })
    categoria: CategoriaTarea;

    @Column({ type: 'date', nullable: true })
    fecha_limite: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    fecha_completada: Date | null;

    // Quién creó la tarea (Admin o Supervisor)
    @ManyToOne(() => Usuario, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'creado_por_id' })
    creado_por: Usuario;

    @Column({ name: 'creado_por_id' })
    creado_por_id: number;

    // A quién está asignada (Colaborador)
    @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'asignado_a_id' })
    asignado_a: Usuario | null;

    @Column({ name: 'asignado_a_id', nullable: true })
    asignado_a_id: number | null;

    // Finca donde se realiza la tarea
    @ManyToOne(() => Finca, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'finca_id' })
    finca: Finca;

    @Column({ name: 'finca_id' })
    finca_id: number;

    // Potrero específico (opcional)
    @ManyToOne(() => Potrero, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'potrero_id' })
    potrero: Potrero | null;

    @Column({ name: 'potrero_id', nullable: true })
    potrero_id: number | null;

    // Campos del reporte de problema (subido por el Colaborador)
    @Column({ type: 'varchar', length: 500, nullable: true, name: 'reporte_foto_url' })
    reporte_foto_url: string | null;

    @Column({ type: 'text', nullable: true, name: 'reporte_descripcion' })
    reporte_descripcion: string | null;

    @Column({ type: 'timestamp', nullable: true, name: 'reporte_fecha' })
    reporte_fecha: Date | null;

    // Notas adicionales del supervisor al verificar
    @Column({ type: 'text', nullable: true, name: 'notas_supervisor' })
    notas_supervisor: string | null;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'eliminado_en', nullable: true })
    eliminado_en: Date | null;
}
