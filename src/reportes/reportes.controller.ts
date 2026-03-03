import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FincaAccessGuard } from '../auth/guards/finca-access.guard';

/**
 * Controlador de Reportes y KPIs
 * Todos los endpoints requieren autenticación JWT y acceso a la finca.
 *
 * Base URL:  /reportes/finca/:fincaId
 */
@Controller('reportes/finca/:fincaId')
@UseGuards(JwtAuthGuard, FincaAccessGuard)
export class ReportesController {
    constructor(private readonly reportesService: ReportesService) { }

    // ─── RESUMEN GENERAL ───────────────────────────────────────────────────────

    /**
     * GET /reportes/finca/:fincaId/resumen
     * KPIs principales de la finca: conteo de animales, litros del mes, partos, alertas.
     */
    @Get('resumen')
    getResumen(@Param('fincaId', ParseIntPipe) fincaId: number) {
        return this.reportesService.getResumenFinca(fincaId);
    }

    // ─── PRODUCCIÓN DE LECHE ───────────────────────────────────────────────────

    /**
     * GET /reportes/finca/:fincaId/produccion-leche/mensual?meses=12
     * Producción mensual de los últimos N meses.
     */
    @Get('produccion-leche/mensual')
    getProduccionMensual(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Query('meses') meses?: string,
    ) {
        return this.reportesService.getProduccionMensual(
            fincaId,
            meses ? parseInt(meses, 10) : 12,
        );
    }

    /**
     * GET /reportes/finca/:fincaId/produccion-leche/top-animales?top=10
     * Top N animales con mayor producción acumulada.
     */
    @Get('produccion-leche/top-animales')
    getTopAnimalesProductores(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Query('top') top?: string,
    ) {
        return this.reportesService.getTopAnimalesProductores(
            fincaId,
            top ? parseInt(top, 10) : 10,
        );
    }

    /**
     * GET /reportes/finca/:fincaId/produccion-leche/por-jornada
     * Distribución de litros por jornada (mañana / tarde).
     */
    @Get('produccion-leche/por-jornada')
    getProduccionPorJornada(@Param('fincaId', ParseIntPipe) fincaId: number) {
        return this.reportesService.getProduccionPorJornada(fincaId);
    }

    // ─── REPRODUCCIÓN ──────────────────────────────────────────────────────────

    /**
     * GET /reportes/finca/:fincaId/reproduccion?meses=12
     * Partos por mes, distribución por tipo de monta y preñeces activas.
     */
    @Get('reproduccion')
    getEstadisticasReproduccion(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Query('meses') meses?: string,
    ) {
        return this.reportesService.getEstadisticasReproduccion(
            fincaId,
            meses ? parseInt(meses, 10) : 12,
        );
    }

    // ─── SANIDAD ───────────────────────────────────────────────────────────────

    /**
     * GET /reportes/finca/:fincaId/sanidad?meses=12
     * Controles sanitarios por tipo, costo total acumulado y evolución mensual.
     */
    @Get('sanidad')
    getEstadisticasSanidad(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Query('meses') meses?: string,
    ) {
        return this.reportesService.getEstadisticasSanidad(
            fincaId,
            meses ? parseInt(meses, 10) : 12,
        );
    }

    // ─── EVENTOS ───────────────────────────────────────────────────────────────

    /**
     * GET /reportes/finca/:fincaId/eventos?meses=6
     * Distribución de eventos por tipo y evolución mensual.
     */
    @Get('eventos')
    getEstadisticasEventos(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Query('meses') meses?: string,
    ) {
        return this.reportesService.getEstadisticasEventos(
            fincaId,
            meses ? parseInt(meses, 10) : 6,
        );
    }

    // ─── ANIMALES AGREGADOS ────────────────────────────────────────────────────

    /**
     * GET /reportes/finca/:fincaId/animales/distribucion-raza
     * Distribución del hato por raza.
     */
    @Get('animales/distribucion-raza')
    getDistribucionPorRaza(@Param('fincaId', ParseIntPipe) fincaId: number) {
        return this.reportesService.getDistribucionPorRaza(fincaId);
    }

    /**
     * GET /reportes/finca/:fincaId/animales/distribucion-etapa-vida
     * Distribución del hato por etapa de vida.
     */
    @Get('animales/distribucion-etapa-vida')
    getDistribucionPorEtapaVida(@Param('fincaId', ParseIntPipe) fincaId: number) {
        return this.reportesService.getDistribucionPorEtapaVida(fincaId);
    }

    /**
     * GET /reportes/finca/:fincaId/animales/distribucion-salud
     * Distribución del hato por estado de salud.
     */
    @Get('animales/distribucion-salud')
    getDistribucionPorEstadoSalud(
        @Param('fincaId', ParseIntPipe) fincaId: number,
    ) {
        return this.reportesService.getDistribucionPorEstadoSalud(fincaId);
    }

    // ─── EXPORTACIÓN ───────────────────────────────────────────────────────────

    /**
     * GET /reportes/finca/:fincaId/exportar/excel?meses=12&nombre=MiFinca
     * Descarga un archivo Excel (.xlsx) con todos los KPIs de la finca.
     */
    @Get('exportar/excel')
    async exportarExcel(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Query('meses') meses: string,
        @Query('nombre') nombre: string,
        @Res() res: Response,
    ) {
        const buffer = await this.reportesService.generarExcelFinca(
            fincaId,
            meses ? parseInt(meses, 10) : 12,
        );
        const filename = `reporte-finca-${fincaId}-${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        res.end(buffer);
    }

    /**
     * GET /reportes/finca/:fincaId/exportar/pdf?meses=12&nombre=MiFinca
     * Descarga un reporte PDF completo con los KPIs de la finca.
     */
    @Get('exportar/pdf')
    async exportarPdf(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Query('meses') meses: string,
        @Query('nombre') nombre: string,
        @Res() res: Response,
    ) {
        const buffer = await this.reportesService.generarPdfFinca(
            fincaId,
            meses ? parseInt(meses, 10) : 12,
            nombre || `Finca-${fincaId}`,
        );
        const filename = `reporte-finca-${fincaId}-${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        res.end(buffer);
    }
}
