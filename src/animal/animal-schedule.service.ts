// src/animal/animal-schedule.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, LessThan } from 'typeorm';
import { Animal, EtapaVida, SexoAnimal, EstadoReproductivo } from './entities/animal.entity';
import { Reproduccion } from '../reproduccion/entities/reproduccion.entity';

@Injectable()
export class AnimalScheduleService {
  private readonly logger = new Logger(AnimalScheduleService.name);

  constructor(
    @InjectRepository(Animal)
    private animal_repository: Repository<Animal>,
    @InjectRepository(Reproduccion)
    private reproduccion_repository: Repository<Reproduccion>,
  ) {}

  // Ejecuta diariamente a las 2:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async actualizar_etapas_vida() {
    this.logger.log('Iniciando actualización de etapas de vida...');
    
    const animales = await this.animal_repository.find({
      where: { 
        fecha_nacimiento: Not(IsNull()),
        eliminado_en: IsNull()
      },
      relations: ['reproducciones_madre']
    });

    let actualizados = 0;

    for (const animal of animales) {
      const nueva_etapa = this.calcular_etapa_vida(animal);
      
      if (nueva_etapa && nueva_etapa !== animal.etapa_vida) {
        animal.etapa_vida = nueva_etapa;
        await this.animal_repository.save(animal);
        actualizados++;
      }
    }

    this.logger.log(`Etapas de vida actualizadas: ${actualizados} animales`);
  }

  // Ejecuta diariamente a las 3:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async calcular_fechas_probables_parto() {
    this.logger.log('Calculando fechas probables de parto...');

    const reproducciones_confirmadas = await this.reproduccion_repository.find({
      where: {
        fecha_confirmacion_prenez: Not(IsNull()),
        fecha_parto: IsNull(),
      },
      relations: ['madre']
    });

    let calculadas = 0;

    for (const reproduccion of reproducciones_confirmadas) {
      if (reproduccion.fecha_confirmacion_prenez && reproduccion.madre) {
        // Gestación bovina: ~280 días (9 meses)
        const fecha_probable = new Date(reproduccion.fecha_confirmacion_prenez);
        fecha_probable.setDate(fecha_probable.getDate() + 280);

        if (reproduccion.madre.fecha_probable_parto?.getTime() !== fecha_probable.getTime()) {
          reproduccion.madre.fecha_probable_parto = fecha_probable;
          
          // Actualizar estado reproductivo si no está ya como prenada
          if (reproduccion.madre.estado_reproductivo !== EstadoReproductivo.PRENADA) {
            reproduccion.madre.estado_reproductivo = EstadoReproductivo.PRENADA;
          }
          
          await this.animal_repository.save(reproduccion.madre);
          calculadas++;
        }
      }
    }

    this.logger.log(`Fechas probables de parto calculadas: ${calculadas} animales`);
  }

  // Ejecuta diariamente a las 4:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async verificar_controles_sanitarios_pendientes() {
    this.logger.log('Verificando controles sanitarios pendientes...');

    const animales = await this.animal_repository.find({
      where: { eliminado_en: IsNull() },
      relations: ['controles_sanitarios']
    });

    let alertas_activadas = 0;
    const dias_limite = 90; // 3 meses sin control sanitario

    for (const animal of animales) {
      let ultima_fecha: Date | null = null;

      if (animal.controles_sanitarios && animal.controles_sanitarios.length > 0) {
        // Encontrar el control más reciente
        ultima_fecha = animal.controles_sanitarios
          .map(c => c.fecha)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
      }

      animal.ultima_fecha_control_sanitario = ultima_fecha;

      // Verificar si requiere atención
      const requiere_atencion = ultima_fecha 
        ? this.dias_desde(ultima_fecha) > dias_limite
        : true; // Si nunca ha tenido control, requiere atención

      if (requiere_atencion !== animal.requiere_atencion_sanitaria) {
        animal.requiere_atencion_sanitaria = requiere_atencion;
        alertas_activadas++;
      }

      await this.animal_repository.save(animal);
    }

    this.logger.log(`Alertas sanitarias actualizadas: ${alertas_activadas} animales`);
  }

  // Ejecuta diariamente a las 5:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async actualizar_estados_post_parto() {
    this.logger.log('Actualizando estados post-parto...');

    const reproducciones_con_parto = await this.reproduccion_repository.find({
      where: {
        fecha_parto: Not(IsNull()),
      },
      relations: ['madre']
    });

    let actualizados = 0;

    for (const reproduccion of reproducciones_con_parto) {
      if (reproduccion.fecha_parto && reproduccion.madre) {
        const dias_post_parto = this.dias_desde(reproduccion.fecha_parto);
        
        // Si han pasado menos de 60 días del parto, debería estar lactando
        if (dias_post_parto <= 60 && reproduccion.madre.estado_reproductivo !== EstadoReproductivo.LACTANDO) {
          reproduccion.madre.estado_reproductivo = EstadoReproductivo.LACTANDO;
          await this.animal_repository.save(reproduccion.madre);
          actualizados++;
        }
        
        // Si han pasado más de 60 días, vuelve a vacía (si no hay nueva preñez)
        if (dias_post_parto > 60 && reproduccion.madre.estado_reproductivo === EstadoReproductivo.LACTANDO) {
          // Verificar si hay una nueva preñez confirmada
          const nueva_prenez = await this.reproduccion_repository.findOne({
            where: {
              madre: { id: reproduccion.madre.id },
              fecha_confirmacion_prenez: Not(IsNull()),
              fecha_parto: IsNull(),
            }
          });

          if (!nueva_prenez) {
            reproduccion.madre.estado_reproductivo = EstadoReproductivo.VACIA;
            reproduccion.madre.fecha_probable_parto = null;
            await this.animal_repository.save(reproduccion.madre);
            actualizados++;
          }
        }
      }
    }

    this.logger.log(`Estados post-parto actualizados: ${actualizados} animales`);
  }

  // Método helper para calcular etapa de vida
  private calcular_etapa_vida(animal: Animal): EtapaVida | null {
    if (!animal.fecha_nacimiento) return null;

    const edad_meses = this.calcular_edad_meses(animal.fecha_nacimiento);
    const es_macho = animal.sexo === SexoAnimal.MACHO;

    // Ternero/a: 0-8 meses
    if (edad_meses < 8) {
      return es_macho ? EtapaVida.TERNERO : EtapaVida.TERNERA;
    }

    // Novillo/a: 8-24 meses (machos) / 8-30 meses hasta primer parto (hembras)
    if (es_macho && edad_meses >= 8 && edad_meses < 24) {
      return EtapaVida.NOVILLO;
    }

    if (!es_macho && edad_meses >= 8 && edad_meses < 30) {
      // Para hembras, verificar si ya tuvo primer parto
      const tuvo_parto = animal.reproducciones_madre?.some(r => r.fecha_parto !== null);
      if (!tuvo_parto) {
        return EtapaVida.NOVILLA;
      }
    }

    // Adulto mayor: 8+ años (96+ meses)
    if (edad_meses >= 96) {
      return EtapaVida.ADULTO_MAYOR;
    }

    // Adulto/a: resto de casos
    return es_macho ? EtapaVida.ADULTO : EtapaVida.ADULTA;
  }

  private calcular_edad_meses(fecha_nacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fecha_nacimiento);
    
    let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12;
    meses += hoy.getMonth() - nacimiento.getMonth();
    
    if (hoy.getDate() < nacimiento.getDate()) {
      meses--;
    }
    
    return Math.max(0, meses);
  }

  private dias_desde(fecha: Date): number {
    const hoy = new Date();
    const fecha_comparar = new Date(fecha);
    const diff = hoy.getTime() - fecha_comparar.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // Método público para calcular etapa manualmente (útil al crear/actualizar animal)
  public obtener_etapa_vida(animal: Animal): EtapaVida | null {
    return this.calcular_etapa_vida(animal);
  }
}