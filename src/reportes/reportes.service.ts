// src/reportes/reportes.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
// pdfmake: usamos PdfPrinter (API Node.js) — require para evitar problemas de tipos
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinter = require('pdfmake') as any;


import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';

import { Animal, SexoAnimal, EstadoSalud } from '../animal/entities/animal.entity';
import { ProduccionLeche } from '../produccion-leche/entities/produccion-leche.entity';
import { Reproduccion } from '../reproduccion/entities/reproduccion.entity';
import { ControlSanitario } from '../control-sanitario/entities/control-sanitario.entity';
import { EventoAnimal } from '../evento-animal/entities/evento-animal.entity';
import { Cria } from '../cria/entities/cria.entity';

@Injectable()
export class ReportesService {
    constructor(
        @InjectRepository(Animal)
        private animalRepo: Repository<Animal>,

        @InjectRepository(ProduccionLeche)
        private produccionLecheRepo: Repository<ProduccionLeche>,

        @InjectRepository(Reproduccion)
        private reproduccionRepo: Repository<Reproduccion>,

        @InjectRepository(ControlSanitario)
        private controlSanitarioRepo: Repository<ControlSanitario>,

        @InjectRepository(EventoAnimal)
        private eventoAnimalRepo: Repository<EventoAnimal>,

        @InjectRepository(Cria)
        private criaRepo: Repository<Cria>,
    ) {
        // Cargar fuentes Roboto desde el VFS de pdfmake (base64 → Buffer)
        const vfsFontsModule = require('pdfmake/build/vfs_fonts');
        const vfs = vfsFontsModule?.pdfMake?.vfs ?? vfsFontsModule?.vfs ?? {};
        this.pdfPrinter = new PdfPrinter({
            Roboto: {
                normal: Buffer.from(vfs['Roboto-Regular.ttf'] ?? '', 'base64'),
                bold: Buffer.from(vfs['Roboto-Medium.ttf'] ?? '', 'base64'),
                italics: Buffer.from(vfs['Roboto-Italic.ttf'] ?? '', 'base64'),
                bolditalics: Buffer.from(vfs['Roboto-MediumItalic.ttf'] ?? '', 'base64'),
            },
        });
    }

    private readonly pdfPrinter: any;

    // ──────────────────────────────────────────────
    // KPI RESUMEN GENERAL DE UNA FINCA
    // ──────────────────────────────────────────────
    async getResumenFinca(finca_id: number) {
        const [
            totalAnimales,
            totalMachos,
            totalHembras,
            animalesEnfermos,
            animalesEnTratamiento,
            animalesConAlerta,
        ] = await Promise.all([
            this.animalRepo.count({ where: { finca_id } }),
            this.animalRepo.count({ where: { finca_id, sexo: SexoAnimal.MACHO } }),
            this.animalRepo.count({ where: { finca_id, sexo: SexoAnimal.HEMBRA } }),
            this.animalRepo.count({ where: { finca_id, estado_salud: EstadoSalud.DIAGNOSTICADO_ENFERMO } }),
            this.animalRepo.count({ where: { finca_id, estado_salud: EstadoSalud.EN_TRATAMIENTO } }),
            this.animalRepo.count({ where: { finca_id, requiere_atencion_sanitaria: true } }),
        ]);

        // Producción total del mes actual
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        const produccionMesResult = await this.produccionLecheRepo
            .createQueryBuilder('pl')
            .select('SUM(pl.cantidad)', 'total')
            .where('pl.finca_id = :finca_id', { finca_id })
            .andWhere('pl.fecha BETWEEN :inicio AND :fin', {
                inicio: inicioMes.toISOString().split('T')[0],
                fin: finMes.toISOString().split('T')[0],
            })
            .getRawOne();

        // Partos del mes actual
        const partosResult = await this.reproduccionRepo
            .createQueryBuilder('r')
            .innerJoin('r.madre', 'a')
            .select('COUNT(r.id)', 'total')
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere('r.fecha_parto BETWEEN :inicio AND :fin', {
                inicio: inicioMes.toISOString().split('T')[0],
                fin: finMes.toISOString().split('T')[0],
            })
            .getRawOne();

        // Próximos partos (30 días)
        const proxy30 = new Date();
        proxy30.setDate(proxy30.getDate() + 30);
        const proximosPartosResult = await this.animalRepo
            .createQueryBuilder('a')
            .select('COUNT(a.id)', 'total')
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere('a.fecha_probable_parto BETWEEN :hoy AND :proxy', {
                hoy: hoy.toISOString().split('T')[0],
                proxy: proxy30.toISOString().split('T')[0],
            })
            .getRawOne();

        return {
            animales: {
                total: totalAnimales,
                machos: totalMachos,
                hembras: totalHembras,
                enfermos: animalesEnfermos,
                en_tratamiento: animalesEnTratamiento,
                con_alerta_sanitaria: animalesConAlerta,
            },
            produccion_leche: {
                litros_mes_actual: parseFloat(produccionMesResult?.total || '0'),
            },
            reproduccion: {
                partos_mes_actual: parseInt(partosResult?.total || '0', 10),
                proximos_partos_30_dias: parseInt(proximosPartosResult?.total || '0', 10),
            },
        };
    }

    // ──────────────────────────────────────────────
    // PRODUCCIÓN DE LECHE
    // ──────────────────────────────────────────────

    /** Producción mensual de los últimos N meses (para gráfico de tendencia) */
    async getProduccionMensual(finca_id: number, meses = 12) {
        const rows = await this.produccionLecheRepo
            .createQueryBuilder('pl')
            .select([
                `DATE_FORMAT(pl.fecha, '%Y-%m') AS mes`,
                `SUM(pl.cantidad) AS total_litros`,
                `COUNT(DISTINCT pl.animal_id) AS animales_activos`,
                `AVG(pl.cantidad) AS promedio_diario`,
            ])
            .where('pl.finca_id = :finca_id', { finca_id })
            .andWhere(
                `pl.fecha >= DATE_SUB(CURDATE(), INTERVAL :meses MONTH)`,
                { meses },
            )
            .groupBy(`DATE_FORMAT(pl.fecha, '%Y-%m')`)
            .orderBy(`mes`, 'ASC')
            .getRawMany();

        return rows.map((r) => ({
            mes: r.mes,
            total_litros: parseFloat(r.total_litros || '0'),
            animales_activos: parseInt(r.animales_activos || '0', 10),
            promedio_diario: parseFloat(r.promedio_diario || '0'),
        }));
    }

    /** Top N animales por producción acumulada */
    async getTopAnimalesProductores(finca_id: number, top = 10) {
        const rows = await this.produccionLecheRepo
            .createQueryBuilder('pl')
            .innerJoin('pl.animal', 'a')
            .select([
                'a.id AS animal_id',
                'a.identificador_unico AS identificador',
                'a.raza AS raza',
                'SUM(pl.cantidad) AS total_litros',
                'COUNT(pl.id) AS registros',
            ])
            .where('pl.finca_id = :finca_id', { finca_id })
            .groupBy('a.id')
            .orderBy('total_litros', 'DESC')
            .limit(top)
            .getRawMany();

        return rows.map((r) => ({
            animal_id: r.animal_id,
            identificador: r.identificador,
            raza: r.raza,
            total_litros: parseFloat(r.total_litros || '0'),
            registros: parseInt(r.registros || '0', 10),
        }));
    }

    /** Producción por jornada (mañana vs tarde) */
    async getProduccionPorJornada(finca_id: number) {
        const rows = await this.produccionLecheRepo
            .createQueryBuilder('pl')
            .select([
                'pl.jornada AS jornada',
                'SUM(pl.cantidad) AS total_litros',
                'COUNT(pl.id) AS registros',
            ])
            .where('pl.finca_id = :finca_id', { finca_id })
            .groupBy('pl.jornada')
            .getRawMany();

        return rows.map((r) => ({
            jornada: r.jornada,
            total_litros: parseFloat(r.total_litros || '0'),
            registros: parseInt(r.registros || '0', 10),
        }));
    }

    // ──────────────────────────────────────────────
    // REPRODUCCIÓN
    // ──────────────────────────────────────────────

    /** Estadísticas de reproducción: partos por mes, tasa de preñez, tipo de monta */
    async getEstadisticasReproduccion(finca_id: number, meses = 12) {
        // Partos por mes
        const partosPorMes = await this.reproduccionRepo
            .createQueryBuilder('r')
            .innerJoin('r.madre', 'a')
            .select([
                `DATE_FORMAT(r.fecha_parto, '%Y-%m') AS mes`,
                'COUNT(r.id) AS total_partos',
                'SUM(r.crias_nacidas) AS total_crias',
            ])
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere('r.fecha_parto IS NOT NULL')
            .andWhere(
                `r.fecha_parto >= DATE_SUB(CURDATE(), INTERVAL :meses MONTH)`,
                { meses },
            )
            .groupBy(`DATE_FORMAT(r.fecha_parto, '%Y-%m')`)
            .orderBy('mes', 'ASC')
            .getRawMany();

        // Distribución por tipo de monta
        const porTipoMonta = await this.reproduccionRepo
            .createQueryBuilder('r')
            .innerJoin('r.madre', 'a')
            .select(['r.tipo_monta AS tipo_monta', 'COUNT(r.id) AS total'])
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere('r.tipo_monta IS NOT NULL')
            .groupBy('r.tipo_monta')
            .getRawMany();

        // Preñeces activas (confirmadas, sin fecha de parto registrada)
        const prenezActiva = await this.reproduccionRepo
            .createQueryBuilder('r')
            .innerJoin('r.madre', 'a')
            .select('COUNT(r.id)', 'total')
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere('r.fecha_confirmacion_prenez IS NOT NULL')
            .andWhere('r.fecha_parto IS NULL')
            .getRawOne();

        return {
            partos_por_mes: partosPorMes.map((r) => ({
                mes: r.mes,
                total_partos: parseInt(r.total_partos || '0', 10),
                total_crias: parseInt(r.total_crias || '0', 10),
            })),
            por_tipo_monta: porTipoMonta.map((r) => ({
                tipo_monta: r.tipo_monta,
                total: parseInt(r.total || '0', 10),
            })),
            prenez_activa: parseInt(prenezActiva?.total || '0', 10),
        };
    }

    // ──────────────────────────────────────────────
    // SANIDAD
    // ──────────────────────────────────────────────

    /** Controles sanitarios por tipo y costo acumulado */
    async getEstadisticasSanidad(finca_id: number, meses = 12) {
        // Por tipo de control
        const porTipo = await this.controlSanitarioRepo
            .createQueryBuilder('cs')
            .innerJoin('cs.animal', 'a')
            .innerJoin('cs.tipo_control', 'tc')
            .select([
                'tc.nombre AS tipo',
                'COUNT(cs.id) AS total',
                'SUM(cs.costo) AS costo_total',
            ])
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere(
                `cs.fecha >= DATE_SUB(CURDATE(), INTERVAL :meses MONTH)`,
                { meses },
            )
            .groupBy('tc.nombre')
            .orderBy('total', 'DESC')
            .getRawMany();

        // Evolución mensual de controles
        const porMes = await this.controlSanitarioRepo
            .createQueryBuilder('cs')
            .innerJoin('cs.animal', 'a')
            .select([
                `DATE_FORMAT(cs.fecha, '%Y-%m') AS mes`,
                'COUNT(cs.id) AS total',
                'SUM(cs.costo) AS costo_total',
            ])
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere(
                `cs.fecha >= DATE_SUB(CURDATE(), INTERVAL :meses MONTH)`,
                { meses },
            )
            .groupBy(`DATE_FORMAT(cs.fecha, '%Y-%m')`)
            .orderBy('mes', 'ASC')
            .getRawMany();

        // Animales con alerta sanitaria activa
        const conAlerta = await this.animalRepo.count({
            where: { finca_id, requiere_atencion_sanitaria: true },
        });

        return {
            por_tipo_control: porTipo.map((r) => ({
                tipo: r.tipo,
                total: parseInt(r.total || '0', 10),
                costo_total: parseFloat(r.costo_total || '0'),
            })),
            por_mes: porMes.map((r) => ({
                mes: r.mes,
                total: parseInt(r.total || '0', 10),
                costo_total: parseFloat(r.costo_total || '0'),
            })),
            animales_con_alerta: conAlerta,
        };
    }

    // ──────────────────────────────────────────────
    // EVENTOS
    // ──────────────────────────────────────────────

    /** Distribución de eventos por tipo */
    async getEstadisticasEventos(finca_id: number, meses = 6) {
        const porTipo = await this.eventoAnimalRepo
            .createQueryBuilder('ea')
            .innerJoin('ea.animal', 'a')
            .innerJoin('ea.tipo_evento', 'te')
            .select([
                'te.nombre AS tipo',
                'COUNT(ea.id) AS total',
            ])
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere(
                `ea.fecha >= DATE_SUB(CURDATE(), INTERVAL :meses MONTH)`,
                { meses },
            )
            .groupBy('te.nombre')
            .orderBy('total', 'DESC')
            .getRawMany();

        const porMes = await this.eventoAnimalRepo
            .createQueryBuilder('ea')
            .innerJoin('ea.animal', 'a')
            .select([
                `DATE_FORMAT(ea.fecha, '%Y-%m') AS mes`,
                'COUNT(ea.id) AS total',
            ])
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere(
                `ea.fecha >= DATE_SUB(CURDATE(), INTERVAL :meses MONTH)`,
                { meses },
            )
            .groupBy(`DATE_FORMAT(ea.fecha, '%Y-%m')`)
            .orderBy('mes', 'ASC')
            .getRawMany();

        return {
            por_tipo_evento: porTipo.map((r) => ({
                tipo: r.tipo,
                total: parseInt(r.total || '0', 10),
            })),
            por_mes: porMes.map((r) => ({
                mes: r.mes,
                total: parseInt(r.total || '0', 10),
            })),
        };
    }

    // ──────────────────────────────────────────────
    // ESTADÍSTICAS DE ANIMALES AGREGADAS
    // ──────────────────────────────────────────────

    /** Distribución por raza */
    async getDistribucionPorRaza(finca_id: number) {
        const rows = await this.animalRepo
            .createQueryBuilder('a')
            .select(['a.raza AS raza', 'COUNT(a.id) AS total'])
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere('a.raza IS NOT NULL')
            .groupBy('a.raza')
            .orderBy('total', 'DESC')
            .getRawMany();

        return rows.map((r) => ({
            raza: r.raza,
            total: parseInt(r.total || '0', 10),
        }));
    }

    /** Distribución por etapa de vida */
    async getDistribucionPorEtapaVida(finca_id: number) {
        const rows = await this.animalRepo
            .createQueryBuilder('a')
            .select(['a.etapa_vida AS etapa', 'COUNT(a.id) AS total'])
            .where('a.finca_id = :finca_id', { finca_id })
            .andWhere('a.etapa_vida IS NOT NULL')
            .groupBy('a.etapa_vida')
            .getRawMany();

        return rows.map((r) => ({
            etapa: r.etapa,
            total: parseInt(r.total || '0', 10),
        }));
    }

    /** Distribución por estado de salud */
    async getDistribucionPorEstadoSalud(finca_id: number) {
        const rows = await this.animalRepo
            .createQueryBuilder('a')
            .select(['a.estado_salud AS estado', 'COUNT(a.id) AS total'])
            .where('a.finca_id = :finca_id', { finca_id })
            .groupBy('a.estado_salud')
            .getRawMany();

        return rows.map((r) => ({
            estado: r.estado,
            total: parseInt(r.total || '0', 10),
        }));
    }

    // ──────────────────────────────────────────────
    // EXPORTACIÓN EXCEL
    // ──────────────────────────────────────────────

    /**
     * Genera un archivo Excel con múltiples hojas:
     * Resumen, Producción de Leche, Reproducción, Sanidad.
     */
    async generarExcelFinca(finca_id: number, meses = 12): Promise<Buffer> {
        const [
            resumen,
            produccionMensual,
            topAnimales,
            estadRep,
            estadSanidad,
            distRaza,
            distEtapa,
            distSalud,
        ] = await Promise.all([
            this.getResumenFinca(finca_id),
            this.getProduccionMensual(finca_id, meses),
            this.getTopAnimalesProductores(finca_id, 10),
            this.getEstadisticasReproduccion(finca_id, meses),
            this.getEstadisticasSanidad(finca_id, meses),
            this.getDistribucionPorRaza(finca_id),
            this.getDistribucionPorEtapaVida(finca_id),
            this.getDistribucionPorEstadoSalud(finca_id),
        ]);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'HERDIX';
        workbook.created = new Date();

        // Estilo encabezado común
        const headerStyle: Partial<ExcelJS.Style> = {
            font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
                bottom: { style: 'thin', color: { argb: 'FF047857' } },
            },
        };
        const addHeaders = (ws: ExcelJS.Worksheet, cols: string[]) => {
            const row = ws.addRow(cols);
            row.eachCell(cell => Object.assign(cell, headerStyle));
            row.height = 22;
        };

        // ── Hoja 1: Resumen ──────────────────────────────────────────────────
        const wsResumen = workbook.addWorksheet('Resumen');
        wsResumen.columns = [
            { header: 'Indicador', key: 'k', width: 34 },
            { header: 'Valor', key: 'v', width: 20 },
        ];
        addHeaders(wsResumen, ['Indicador', 'Valor']);
        const resumenRows = [
            ['Total Animales', resumen.animales.total],
            ['Machos', resumen.animales.machos],
            ['Hembras', resumen.animales.hembras],
            ['Enfermos', resumen.animales.enfermos],
            ['En Tratamiento', resumen.animales.en_tratamiento],
            ['Con Alerta Sanitaria', resumen.animales.con_alerta_sanitaria],
            ['Litros Mes Actual', resumen.produccion_leche.litros_mes_actual],
            ['Partos Mes Actual', resumen.reproduccion.partos_mes_actual],
            ['Próximos Partos (30 días)', resumen.reproduccion.proximos_partos_30_dias],
        ];
        resumenRows.forEach(r => wsResumen.addRow(r));

        // ── Hoja 2: Producción de Leche ──────────────────────────────────────
        const wsProd = workbook.addWorksheet('Producción Leche');
        wsProd.columns = [
            { key: 'mes', width: 14 },
            { key: 'litros', width: 16 },
            { key: 'animales', width: 18 },
            { key: 'prom', width: 20 },
        ];
        addHeaders(wsProd, ['Mes', 'Total Litros', 'Animales Activos', 'Promedio Diario']);
        produccionMensual.forEach(r =>
            wsProd.addRow([r.mes, r.total_litros, r.animales_activos, r.promedio_diario]));

        // ── Hoja 3: Top Animales ─────────────────────────────────────────────
        const wsTop = workbook.addWorksheet('Top Animales');
        wsTop.columns = [
            { key: 'id', width: 12 },
            { key: 'ident', width: 22 },
            { key: 'raza', width: 18 },
            { key: 'litros', width: 16 },
            { key: 'registros', width: 14 },
        ];
        addHeaders(wsTop, ['ID', 'Identificador', 'Raza', 'Total Litros', 'Registros']);
        topAnimales.forEach(r =>
            wsTop.addRow([r.animal_id, r.identificador, r.raza, r.total_litros, r.registros]));

        // ── Hoja 4: Reproducción ─────────────────────────────────────────────
        const wsRep = workbook.addWorksheet('Reproducción');
        wsRep.columns = [
            { key: 'mes', width: 14 },
            { key: 'partos', width: 14 },
            { key: 'crias', width: 14 },
        ];
        addHeaders(wsRep, ['Mes', 'Partos', 'Crías']);
        estadRep.partos_por_mes.forEach(r =>
            wsRep.addRow([r.mes, r.total_partos, r.total_crias]));
        wsRep.addRow([]);
        wsRep.addRow(['Preñeces Activas', estadRep.prenez_activa]);
        wsRep.addRow([]);
        wsRep.addRow(['Tipo de Monta', 'Total']);
        estadRep.por_tipo_monta.forEach(r => wsRep.addRow([r.tipo_monta, r.total]));

        // ── Hoja 5: Sanidad ──────────────────────────────────────────────────
        const wsSan = workbook.addWorksheet('Sanidad');
        wsSan.columns = [
            { key: 'tipo', width: 28 },
            { key: 'total', width: 12 },
            { key: 'costo', width: 18 },
        ];
        addHeaders(wsSan, ['Tipo de Control', 'Total', 'Costo Total']);
        estadSanidad.por_tipo_control.forEach(r =>
            wsSan.addRow([r.tipo, r.total, r.costo_total]));
        wsSan.addRow([]);
        wsSan.addRow(['Mes', 'Total Controles', 'Costo Total']);
        estadSanidad.por_mes.forEach(r => wsSan.addRow([r.mes, r.total, r.costo_total]));

        // ── Hoja 6: Distribución Animales ────────────────────────────────────
        const wsDist = workbook.addWorksheet('Distribución Animales');
        wsDist.addRow(['Por Raza', '']);
        wsDist.addRow(['Raza', 'Total']);
        distRaza.forEach(r => wsDist.addRow([r.raza, r.total]));
        wsDist.addRow([]);
        wsDist.addRow(['Por Etapa de Vida', '']);
        wsDist.addRow(['Etapa', 'Total']);
        distEtapa.forEach(r => wsDist.addRow([r.etapa, r.total]));
        wsDist.addRow([]);
        wsDist.addRow(['Por Estado de Salud', '']);
        wsDist.addRow(['Estado', 'Total']);
        distSalud.forEach(r => wsDist.addRow([r.estado, r.total]));

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    // ──────────────────────────────────────────────
    // EXPORTACIÓN PDF
    // ──────────────────────────────────────────────

    /**
     * Genera un PDF con pdfmake que incluye todos los KPIs de la finca.
     */
    async generarPdfFinca(finca_id: number, meses = 12, fincaNombre = 'Finca'): Promise<Buffer> {
        const [
            resumen,
            produccionMensual,
            topAnimales,
            estadRep,
            estadSanidad,
        ] = await Promise.all([
            this.getResumenFinca(finca_id),
            this.getProduccionMensual(finca_id, meses),
            this.getTopAnimalesProductores(finca_id, 10),
            this.getEstadisticasReproduccion(finca_id, meses),
            this.getEstadisticasSanidad(finca_id, meses),
        ]);

        const verde = '#059669';
        const verdeLight = '#d1fae5';
        const gris = '#64748b';

        const tableHeader = (text: string) => ({
            text, bold: true, color: '#ffffff', fillColor: verde, margin: [4, 6, 4, 6],
        });
        const cell = (text: string | number, shade = false, right = false) => ({
            text: String(text ?? '—'),
            color: '#1e293b',
            fillColor: shade ? verdeLight : '#ffffff',
            margin: [4, 5, 4, 5],
            alignment: right ? 'right' : 'left',
        });

        const docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            defaultStyle: { font: 'Roboto', fontSize: 9 },
            header: {
                columns: [
                    { text: 'HERDIX — Sistema de Gestión Ganadera', style: 'header', margin: [40, 20, 0, 0] },
                    { text: `Generado: ${new Date().toLocaleDateString('es')}`, alignment: 'right', color: gris, margin: [0, 20, 40, 0], fontSize: 8 },
                ],
            },
            footer: (currentPage: number, pageCount: number) => ({
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                color: '#94a3b8',
                fontSize: 8,
                margin: [0, 10, 0, 0],
            }),
            content: [
                // ── Título ────────────────────────────────────────────────────
                {
                    text: `Reporte de Finca: ${fincaNombre}`,
                    style: 'title',
                    margin: [0, 0, 0, 4],
                },
                {
                    text: `Período: últimos ${meses} meses`,
                    color: gris, fontSize: 9, margin: [0, 0, 0, 16],
                },

                // ── KPI Resumen ───────────────────────────────────────────────
                { text: 'Resumen General', style: 'section' },
                {
                    columns: [
                        {
                            stack: [
                                { text: `${resumen.animales.total}`, style: 'kpiValue' },
                                { text: 'Total Animales', style: 'kpiLabel' },
                                { text: `${resumen.animales.machos} machos / ${resumen.animales.hembras} hembras`, color: gris, fontSize: 8 },
                            ],
                            margin: [0, 0, 8, 12],
                        },
                        {
                            stack: [
                                { text: `${resumen.produccion_leche.litros_mes_actual.toFixed(0)} L`, style: 'kpiValue', color: '#0284c7' },
                                { text: 'Litros este Mes', style: 'kpiLabel' },
                                { text: 'Producción acumulada', color: gris, fontSize: 8 },
                            ],
                            margin: [0, 0, 8, 12],
                        },
                        {
                            stack: [
                                { text: `${resumen.reproduccion.partos_mes_actual}`, style: 'kpiValue', color: '#db2777' },
                                { text: 'Partos este Mes', style: 'kpiLabel' },
                                { text: `${resumen.reproduccion.proximos_partos_30_dias} próximos en 30d`, color: gris, fontSize: 8 },
                            ],
                            margin: [0, 0, 8, 12],
                        },
                        {
                            stack: [
                                { text: `${resumen.animales.con_alerta_sanitaria}`, style: 'kpiValue', color: '#d97706' },
                                { text: 'Alertas Sanitarias', style: 'kpiLabel' },
                                { text: `${resumen.animales.enfermos} enfermos`, color: gris, fontSize: 8 },
                            ],
                            margin: [0, 0, 0, 12],
                        },
                    ],
                },

                // ── Producción Mensual ────────────────────────────────────────
                { text: 'Producción de Leche — Últimos Meses', style: 'section' },
                {
                    table: {
                        headerRows: 1,
                        widths: [80, 80, 90, 80],
                        body: [
                            [tableHeader('Mes'), tableHeader('Total Litros'), tableHeader('Animales Activos'), tableHeader('Promedio/día')],
                            ...produccionMensual.map((r, i) => [
                                cell(r.mes, i % 2 === 0),
                                cell(r.total_litros.toFixed(1), i % 2 === 0, true),
                                cell(r.animales_activos, i % 2 === 0, true),
                                cell(r.promedio_diario.toFixed(2), i % 2 === 0, true),
                            ]),
                        ],
                    },
                    layout: 'noBorders',
                    margin: [0, 0, 0, 16],
                },

                // ── Top Animales ──────────────────────────────────────────────
                { text: 'Top 10 Animales Productores', style: 'section' },
                {
                    table: {
                        headerRows: 1,
                        widths: [90, 70, 60, 70],
                        body: [
                            [tableHeader('Identificador'), tableHeader('Raza'), tableHeader('Registros'), tableHeader('Total Litros')],
                            ...topAnimales.map((r, i) => [
                                cell(r.identificador, i % 2 === 0),
                                cell(r.raza, i % 2 === 0),
                                cell(r.registros, i % 2 === 0, true),
                                cell(r.total_litros.toFixed(1), i % 2 === 0, true),
                            ]),
                        ],
                    },
                    layout: 'noBorders',
                    margin: [0, 0, 0, 16],
                },

                // ── Reproducción ──────────────────────────────────────────────
                { text: 'Estadísticas de Reproducción', style: 'section' },
                {
                    columns: [
                        {
                            stack: [
                                { text: 'Partos por Mes', bold: true, color: verde, fontSize: 9, margin: [0, 0, 0, 4] },
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: [55, 40, 40],
                                        body: [
                                            [tableHeader('Mes'), tableHeader('Partos'), tableHeader('Crías')],
                                            ...estadRep.partos_por_mes.map((r, i) => [
                                                cell(r.mes, i % 2 === 0),
                                                cell(r.total_partos, i % 2 === 0, true),
                                                cell(r.total_crias, i % 2 === 0, true),
                                            ]),
                                        ],
                                    },
                                    layout: 'noBorders',
                                },
                            ],
                        },
                        {
                            stack: [
                                { text: 'Tipo de Monta', bold: true, color: verde, fontSize: 9, margin: [0, 0, 0, 4] },
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: [90, 40],
                                        body: [
                                            [tableHeader('Tipo'), tableHeader('Total')],
                                            ...estadRep.por_tipo_monta.map((r, i) => [
                                                cell(r.tipo_monta, i % 2 === 0),
                                                cell(r.total, i % 2 === 0, true),
                                            ]),
                                        ],
                                    },
                                    layout: 'noBorders',
                                },
                                { text: `Preñeces activas: ${estadRep.prenez_activa}`, margin: [0, 8, 0, 0], bold: true, color: '#db2777', fontSize: 9 },
                            ],
                            margin: [8, 0, 0, 0],
                        },
                    ],
                    margin: [0, 0, 0, 16],
                },

                // ── Sanidad ───────────────────────────────────────────────────
                { text: 'Controles Sanitarios', style: 'section' },
                {
                    table: {
                        headerRows: 1,
                        widths: [160, 60, 80],
                        body: [
                            [tableHeader('Tipo de Control'), tableHeader('Total'), tableHeader('Costo Total')],
                            ...estadSanidad.por_tipo_control.map((r, i) => [
                                cell(r.tipo, i % 2 === 0),
                                cell(r.total, i % 2 === 0, true),
                                cell(`$${r.costo_total.toFixed(2)}`, i % 2 === 0, true),
                            ]),
                        ],
                    },
                    layout: 'noBorders',
                    margin: [0, 0, 0, 4],
                },
            ],
            styles: {
                header: { fontSize: 10, bold: true, color: verde },
                title: { fontSize: 16, bold: true, color: '#0f172a' },
                section: { fontSize: 11, bold: true, color: verde, margin: [0, 12, 0, 6], decoration: 'underline' },
                kpiValue: { fontSize: 22, bold: true, color: '#0f172a' },
                kpiLabel: { fontSize: 8, bold: true, color: gris, margin: [0, 2, 0, 2] },
            },
        };

        return new Promise((resolve, reject) => {
            try {
                const pdfDoc = this.pdfPrinter.createPdfKitDocument(docDefinition);
                const chunks: Buffer[] = [];
                pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
                pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
                pdfDoc.on('error', (err: Error) => reject(err));
                pdfDoc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}
