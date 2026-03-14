// src/tarea/tarea.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    UseGuards,
    Query,
    Request,
} from '@nestjs/common';
import { TareaService } from './tarea.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto, CompletarTareaDto, ReportarProblemaTareaDto, CambiarEstadoTareaDto } from './dto/update-tarea.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '../usuario/entities/usuario.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tareas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TareaController {
    constructor(private readonly tareaService: TareaService) { }

    // ─── CREAR TAREA (Admin + Supervisor) ───────────────────────────────────────

    @Post()
    @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR)
    async crear(@Body() dto: CreateTareaDto) {
        return this.tareaService.crear(dto);
    }

    // ─── LISTAR TODAS (Admin + Supervisor) ───────────────────────────────────────

    @Get()
    @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR)
    async obtener_todas(@Query('finca_id') finca_id?: string) {
        return this.tareaService.obtener_todas(finca_id ? +finca_id : undefined);
    }

    // ─── TAREAS POR FINCA (Admin + Supervisor) ────────────────────────────────────

    @Get('por-finca/:finca_id')
    @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR)
    async obtener_por_finca(@Param('finca_id') finca_id: string) {
        return this.tareaService.obtener_por_finca(+finca_id);
    }

    // ─── ESTADÍSTICAS POR FINCA (Admin + Supervisor) ─────────────────────────────

    @Get('estadisticas/finca/:finca_id')
    @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR)
    async obtener_estadisticas(@Param('finca_id') finca_id: string) {
        return this.tareaService.obtener_estadisticas_finca(+finca_id);
    }

    // ─── TAREAS CON REPORTES DE PROBLEMAS (Admin + Supervisor) ───────────────────

    @Get('con-reporte/finca/:finca_id')
    @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR)
    async obtener_con_reporte(@Param('finca_id') finca_id: string) {
        return this.tareaService.obtener_tareas_con_reporte(+finca_id);
    }

    // ─── MIS TAREAS (el Colaborador ve solo sus tareas) ───────────────────────────

    @Get('mis-tareas/:colaborador_id')
    @Roles(RolUsuario.COLABORADOR, RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR)
    async obtener_mis_tareas(@Param('colaborador_id') colaborador_id: string) {
        return this.tareaService.obtener_mis_tareas(+colaborador_id);
    }

    // ─── MIS TAREAS PENDIENTES ────────────────────────────────────────────────────

    @Get('mis-tareas/:colaborador_id/pendientes')
    @Roles(RolUsuario.COLABORADOR, RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR)
    async obtener_mis_tareas_pendientes(@Param('colaborador_id') colaborador_id: string) {
        return this.tareaService.obtener_mis_tareas_pendientes(+colaborador_id);
    }

    // ─── VER UNA TAREA ────────────────────────────────────────────────────────────

    @Get(':id')
    @Roles(
        RolUsuario.ADMINISTRADOR,
        RolUsuario.SUPERVISOR,
        RolUsuario.COLABORADOR,
        RolUsuario.VETERINARIO,
    )
    async obtener_por_id(@Param('id') id: string) {
        return this.tareaService.obtener_por_id(+id);
    }

    // ─── ACTUALIZAR TAREA (Admin + Supervisor) ────────────────────────────────────

    @Patch(':id')
    @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR)
    async actualizar(@Param('id') id: string, @Body() dto: UpdateTareaDto) {
        return this.tareaService.actualizar(+id, dto);
    }

    // ─── CAMBIAR ESTADO (Admin + Supervisor: pueden poner cualquier estado) ───────

    @Patch(':id/estado')
    @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR)
    async cambiar_estado(
        @Param('id') id: string,
        @Body() dto: CambiarEstadoTareaDto,
    ) {
        return this.tareaService.cambiar_estado(+id, dto);
    }

    // ─── INICIAR TAREA (Colaborador: de pendiente a en_curso) ────────────────────

    @Patch(':id/iniciar')
    @Roles(RolUsuario.COLABORADOR)
    async iniciar_tarea(@Param('id') id: string, @Request() req: any) {
        return this.tareaService.iniciar_tarea(+id, req.user.id);
    }

    // ─── COMPLETAR TAREA (Colaborador: marca su propia tarea como completada) ─────

    @Patch(':id/completar')
    @Roles(RolUsuario.COLABORADOR)
    async completar(@Param('id') id: string, @Request() req: any, @Body() dto: CompletarTareaDto) {
        return this.tareaService.completar_por_colaborador(+id, req.user.id, dto);
    }

    // ─── REPORTAR PROBLEMA (Colaborador: sube foto y descripción) ─────────────────

    @Patch(':id/reportar-problema')
    @Roles(RolUsuario.COLABORADOR)
    async reportar_problema(
        @Param('id') id: string,
        @Request() req: any,
        @Body() dto: ReportarProblemaTareaDto,
    ) {
        return this.tareaService.reportar_problema(+id, req.user.id, dto);
    }

    // ─── ELIMINAR TAREA (solo Admin) ──────────────────────────────────────────────

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(RolUsuario.ADMINISTRADOR)
    async eliminar(@Param('id') id: string) {
        await this.tareaService.eliminar(+id);
    }
}
