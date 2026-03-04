// src/tarea/tarea.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, IsNull } from 'typeorm';
import { Tarea, EstadoTarea } from './entities/tarea.entity';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto, CompletarTareaDto, ReportarProblemaTareaDto, CambiarEstadoTareaDto } from './dto/update-tarea.dto';
import { RolUsuario } from '../usuario/entities/usuario.entity';

const TAREA_RELATIONS = ['creado_por', 'asignado_a', 'finca', 'potrero'];

@Injectable()
export class TareaService {
    constructor(
        @InjectRepository(Tarea)
        private readonly tareaRepo: Repository<Tarea>,
    ) { }

    // ─── CREAR ───────────────────────────────────────────────────────────────────

    async crear(dto: CreateTareaDto): Promise<Tarea> {
        const tarea = this.tareaRepo.create(dto);
        return this.tareaRepo.save(tarea);
    }

    // ─── LISTAR TODAS (Admin y Supervisor) ───────────────────────────────────────

    async obtener_todas(finca_id?: number): Promise<Tarea[]> {
        const where: any = {};
        if (finca_id) where.finca_id = finca_id;

        return this.tareaRepo.find({
            where,
            relations: TAREA_RELATIONS,
            order: { created_at: 'DESC' },
        });
    }

    // ─── TAREAS POR FINCA ─────────────────────────────────────────────────────────

    async obtener_por_finca(finca_id: number): Promise<Tarea[]> {
        return this.tareaRepo.find({
            where: { finca_id },
            relations: TAREA_RELATIONS,
            order: { fecha_limite: 'ASC', prioridad: 'DESC' },
        });
    }

    // ─── MIS TAREAS (Colaborador: solo las asignadas a él) ───────────────────────

    async obtener_mis_tareas(colaborador_id: number): Promise<Tarea[]> {
        return this.tareaRepo.find({
            where: { asignado_a_id: colaborador_id },
            relations: TAREA_RELATIONS,
            order: { fecha_limite: 'ASC', prioridad: 'DESC' },
        });
    }

    // ─── MIS TAREAS PENDIENTES (Colaborador) ─────────────────────────────────────

    async obtener_mis_tareas_pendientes(colaborador_id: number): Promise<Tarea[]> {
        return this.tareaRepo.find({
            where: [
                { asignado_a_id: colaborador_id, estado: EstadoTarea.PENDIENTE },
                { asignado_a_id: colaborador_id, estado: EstadoTarea.EN_CURSO },
                { asignado_a_id: colaborador_id, estado: EstadoTarea.VENCIDA },
            ],
            relations: TAREA_RELATIONS,
            order: { prioridad: 'DESC', fecha_limite: 'ASC' },
        });
    }

    // ─── OBTENER UNA ──────────────────────────────────────────────────────────────

    async obtener_por_id(id: number): Promise<Tarea> {
        const tarea = await this.tareaRepo.findOne({
            where: { id },
            relations: TAREA_RELATIONS,
        });
        if (!tarea) throw new NotFoundException(`Tarea #${id} no encontrada`);
        return tarea;
    }

    // ─── ACTUALIZAR (Admin / Supervisor) ─────────────────────────────────────────

    async actualizar(id: number, dto: UpdateTareaDto): Promise<Tarea> {
        const tarea = await this.obtener_por_id(id);
        Object.assign(tarea, dto);
        return this.tareaRepo.save(tarea);
    }

    // ─── CAMBIAR ESTADO (Admin / Supervisor) ─────────────────────────────────────

    async cambiar_estado(id: number, dto: CambiarEstadoTareaDto): Promise<Tarea> {
        const tarea = await this.obtener_por_id(id);
        tarea.estado = dto.estado;

        if (dto.estado === EstadoTarea.COMPLETADA && !tarea.fecha_completada) {
            tarea.fecha_completada = new Date();
        }

        if (dto.notas_supervisor) {
            tarea.notas_supervisor = dto.notas_supervisor;
        }

        return this.tareaRepo.save(tarea);
    }

    // ─── MARCAR EN CURSO (Colaborador inicia la tarea) ───────────────────────────

    async iniciar_tarea(id: number, colaborador_id: number): Promise<Tarea> {
        const tarea = await this.obtener_por_id(id);

        if (tarea.asignado_a_id !== colaborador_id) {
            throw new ForbiddenException('Solo puedes iniciar tareas asignadas a ti');
        }
        if (tarea.estado !== EstadoTarea.PENDIENTE) {
            throw new ForbiddenException(`No puedes iniciar una tarea en estado: ${tarea.estado}`);
        }

        tarea.estado = EstadoTarea.EN_CURSO;
        return this.tareaRepo.save(tarea);
    }

    // ─── COMPLETAR (el Colaborador marca su tarea como completada) ────────────────

    async completar_por_colaborador(
        id: number,
        colaborador_id: number,
        dto: CompletarTareaDto,
    ): Promise<Tarea> {
        const tarea = await this.obtener_por_id(id);

        if (tarea.asignado_a_id !== colaborador_id) {
            throw new ForbiddenException('Solo puedes completar tareas asignadas a ti');
        }
        if (
            tarea.estado === EstadoTarea.CANCELADA ||
            tarea.estado === EstadoTarea.COMPLETADA
        ) {
            throw new ForbiddenException(`La tarea ya está en estado: ${tarea.estado}`);
        }

        tarea.estado = EstadoTarea.COMPLETADA;
        tarea.fecha_completada = new Date();

        if (dto.notas_supervisor) {
            tarea.notas_supervisor = dto.notas_supervisor;
        }

        return this.tareaRepo.save(tarea);
    }

    // ─── REPORTAR PROBLEMA (Colaborador sube foto + descripción) ─────────────────

    async reportar_problema(
        id: number,
        colaborador_id: number,
        dto: ReportarProblemaTareaDto,
    ): Promise<Tarea> {
        const tarea = await this.obtener_por_id(id);

        if (tarea.asignado_a_id !== colaborador_id) {
            throw new ForbiddenException('Solo puedes reportar problemas en tus tareas');
        }

        tarea.reporte_foto_url = dto.reporte_foto_url ?? tarea.reporte_foto_url;
        tarea.reporte_descripcion = dto.reporte_descripcion ?? tarea.reporte_descripcion;
        tarea.reporte_fecha = new Date();

        return this.tareaRepo.save(tarea);
    }

    // ─── ESTADÍSTICAS POR FINCA (Panel del Supervisor / Admin) ───────────────────

    async obtener_estadisticas_finca(finca_id: number): Promise<{
        total: number;
        pendientes: number;
        en_curso: number;
        completadas: number;
        vencidas: number;
        canceladas: number;
        porcentaje_completado: number;
    }> {
        const [total, pendientes, en_curso, completadas, vencidas, canceladas] =
            await Promise.all([
                this.tareaRepo.count({ where: { finca_id } }),
                this.tareaRepo.count({ where: { finca_id, estado: EstadoTarea.PENDIENTE } }),
                this.tareaRepo.count({ where: { finca_id, estado: EstadoTarea.EN_CURSO } }),
                this.tareaRepo.count({ where: { finca_id, estado: EstadoTarea.COMPLETADA } }),
                this.tareaRepo.count({ where: { finca_id, estado: EstadoTarea.VENCIDA } }),
                this.tareaRepo.count({ where: { finca_id, estado: EstadoTarea.CANCELADA } }),
            ]);

        const porcentaje_completado =
            total > 0 ? Math.round((completadas / total) * 100) : 0;

        return {
            total,
            pendientes,
            en_curso,
            completadas,
            vencidas,
            canceladas,
            porcentaje_completado,
        };
    }

    // ─── TAREAS CON REPORTES PENDIENTES DE REVISAR ────────────────────────────────

    async obtener_tareas_con_reporte(finca_id: number): Promise<Tarea[]> {
        return this.tareaRepo
            .createQueryBuilder('tarea')
            .leftJoinAndSelect('tarea.asignado_a', 'asignado_a')
            .leftJoinAndSelect('tarea.finca', 'finca')
            .leftJoinAndSelect('tarea.potrero', 'potrero')
            .where('tarea.finca_id = :finca_id', { finca_id })
            .andWhere('tarea.reporte_descripcion IS NOT NULL')
            .orderBy('tarea.reporte_fecha', 'DESC')
            .getMany();
    }

    // ─── ELIMINAR (soft-delete) ───────────────────────────────────────────────────

    async eliminar(id: number): Promise<void> {
        const tarea = await this.obtener_por_id(id);
        await this.tareaRepo.softRemove(tarea);
    }
}
