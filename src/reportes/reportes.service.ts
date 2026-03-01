// src/reportes/reportes.service.ts
import { Injectable } from '@nestjs/common';
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
    ) { }

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
}
