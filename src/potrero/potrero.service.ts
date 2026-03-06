// src/potrero/potrero.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Potrero, EstadoPasto } from './entities/potrero.entity';
import { Finca } from '../finca/entities/finca.entity';
import { Animal } from '../animal/entities/animal.entity';
import { CreatePotreroDto } from './dto/create-potrero.dto';
import { UpdatePotreroDto } from './dto/update-potrero.dto';
import { RotacionPotreroDto } from './dto/rotacion-potrero.dto';

export interface RotacionResult {
  potrero_origen: Potrero;
  potrero_destino: Potrero;
  animales_movidos: number;
  motivo: string;
  fecha_rotacion: Date;
}

@Injectable()
export class PotreroService {
  constructor(
    @InjectRepository(Potrero)
    private potreroRepository: Repository<Potrero>,
    @InjectRepository(Finca)
    private fincaRepository: Repository<Finca>,
    @InjectRepository(Animal)
    private animalRepository: Repository<Animal>,
  ) { }

  async create(createPotreroDto: CreatePotreroDto): Promise<Potrero> {
    const { finca_id, ...potreroData } = createPotreroDto;

    const finca = await this.fincaRepository.findOne({ where: { id: finca_id } });
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${finca_id} no encontrada.`);
    }

    const newPotrero = this.potreroRepository.create({
      ...potreroData,
      finca: finca,
      finca_id: finca.id,
    });
    return this.potreroRepository.save(newPotrero);
  }

  async findAll(): Promise<Potrero[]> {
    return this.potreroRepository.find({ relations: ['finca'] });
  }

  async findOne(id: number): Promise<Potrero> {
    const potrero = await this.potreroRepository.findOne({
      where: { id },
      relations: ['finca', 'animales'],
    });
    if (!potrero) {
      throw new NotFoundException(`Potrero con ID ${id} no encontrado.`);
    }
    return potrero;
  }

  async update(id: number, updatePotreroDto: UpdatePotreroDto): Promise<Potrero> {
    const potrero = await this.findOne(id);

    if (updatePotreroDto.finca_id) {
      const newFinca = await this.fincaRepository.findOne({ where: { id: updatePotreroDto.finca_id } });
      if (!newFinca) {
        throw new NotFoundException(`Nueva Finca con ID ${updatePotreroDto.finca_id} no encontrada.`);
      }
      potrero.finca = newFinca;
      potrero.finca_id = newFinca.id;
    }

    Object.assign(potrero, updatePotreroDto);
    return this.potreroRepository.save(potrero);
  }

  async remove(id: number): Promise<void> {
    const potrero = await this.potreroRepository.findOne({ where: { id }, relations: ['animales'] });
    if (!potrero) {
      throw new NotFoundException(`Potrero con ID ${id} no encontrado para eliminar.`);
    }
    if (potrero.animales && potrero.animales.length > 0) {
      throw new BadRequestException(`El potrero con ID ${id} no puede ser eliminado porque tiene animales asociados.`);
    }

    const result = await this.potreroRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Potrero con ID ${id} no encontrado para eliminar.`);
    }
  }

  async findPotrerosByFinca(fincaId: number): Promise<Potrero[]> {
    const finca = await this.fincaRepository.findOne({ where: { id: fincaId } });
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${fincaId} no encontrada.`);
    }
    return this.potreroRepository.find({
      where: { finca: { id: fincaId } },
      relations: ['animales', 'finca'],
    });
  }

  // ──────────────────────────────────────────────────────
  //  ROTACIÓN DE POTREROS
  // ──────────────────────────────────────────────────────

  /**
   * Retorna los potreros de una finca con su conteo de animales
   * y datos de pasto para facilitar la toma de decisiones.
   */
  async findPotrerosByFincaConDetalle(fincaId: number): Promise<any[]> {
    const finca = await this.fincaRepository.findOne({ where: { id: fincaId } });
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${fincaId} no encontrada.`);
    }

    const potreros = await this.potreroRepository.find({
      where: { finca: { id: fincaId } },
      relations: ['animales'],
    });

    return potreros.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      tamano_ha: p.tamano_ha,
      tipo_pasto: p.tipo_pasto,
      estado_pasto: p.estado_pasto,
      capacidad_animales: p.capacidad_animales,
      total_animales: p.animales?.length ?? 0,
      animales: p.animales?.map((a) => ({
        id: a.id,
        identificador_unico: a.identificador_unico,
        raza: a.raza,
        sexo: a.sexo,
        etapa_vida: a.etapa_vida,
      })) ?? [],
      // Indica si el potrero puede recibir más animales
      disponible: p.estado_pasto !== EstadoPasto.AGOTADO,
    }));
  }

  /**
   * Ejecuta la rotación: mueve todos los animales del potrero origen al destino.
   * Valida que ambos potreros pertenezcan a la misma finca y que el destino
   * no esté agotado ni supere su capacidad.
   */
  async ejecutarRotacion(dto: RotacionPotreroDto): Promise<RotacionResult> {
    const { potrero_origen_id, potrero_destino_id, motivo } = dto;

    if (potrero_origen_id === potrero_destino_id) {
      throw new BadRequestException('El potrero de origen y destino no pueden ser el mismo.');
    }

    const origen = await this.potreroRepository.findOne({
      where: { id: potrero_origen_id },
      relations: ['animales', 'finca'],
    });
    if (!origen) {
      throw new NotFoundException(`Potrero de origen con ID ${potrero_origen_id} no encontrado.`);
    }

    const destino = await this.potreroRepository.findOne({
      where: { id: potrero_destino_id },
      relations: ['animales', 'finca'],
    });
    if (!destino) {
      throw new NotFoundException(`Potrero de destino con ID ${potrero_destino_id} no encontrado.`);
    }

    // Validar misma finca
    if (origen.finca.id !== destino.finca.id) {
      throw new BadRequestException('Los potreros deben pertenecer a la misma finca.');
    }

    // Validar que el destino no esté agotado
    if (destino.estado_pasto === EstadoPasto.AGOTADO) {
      throw new BadRequestException(
        `El potrero destino "${destino.nombre}" tiene el pasto agotado. Por favor seleccione otro potrero.`,
      );
    }

    // Validar capacidad del destino (si está definida)
    if (destino.capacidad_animales !== null && destino.capacidad_animales !== undefined) {
      const animalesOrigenCount = origen.animales?.length ?? 0;
      const animalesDestinoCount = destino.animales?.length ?? 0;
      const totalTrasRotacion = animalesDestinoCount + animalesOrigenCount;

      if (totalTrasRotacion > destino.capacidad_animales) {
        throw new BadRequestException(
          `El potrero destino "${destino.nombre}" no tiene capacidad suficiente. ` +
          `Capacidad: ${destino.capacidad_animales}, animales actuales: ${animalesDestinoCount}, ` +
          `animales a mover: ${animalesOrigenCount}.`,
        );
      }
    }

    const animalesDelOrigen = origen.animales ?? [];

    if (animalesDelOrigen.length === 0) {
      throw new BadRequestException(
        `El potrero de origen "${origen.nombre}" no tiene animales para rotar.`,
      );
    }

    // Mover todos los animales del origen al destino
    const ids = animalesDelOrigen.map((a) => a.id);
    await this.animalRepository
      .createQueryBuilder()
      .update(Animal)
      .set({ potrero_id: destino.id })
      .whereInIds(ids)
      .execute();

    // Marcar el potrero origen como "en recuperación" → estado REGULAR si estaba BUENO,
    // o dejarlo en AGOTADO si el motivo indica que el pasto se agotó.
    const nuevoEstadoOrigen =
      origen.estado_pasto === EstadoPasto.AGOTADO
        ? EstadoPasto.AGOTADO
        : EstadoPasto.REGULAR;

    await this.potreroRepository.update(origen.id, {
      estado_pasto: nuevoEstadoOrigen,
    });

    // Recargar entidades actualizadas
    const origenActualizado = await this.findOne(origen.id);
    const destinoActualizado = await this.findOne(destino.id);

    return {
      potrero_origen: origenActualizado,
      potrero_destino: destinoActualizado,
      animales_movidos: ids.length,
      motivo: motivo ?? 'Sin motivo especificado',
      fecha_rotacion: new Date(),
    };
  }

  /**
   * Actualiza únicamente el estado del pasto de un potrero.
   */
  async actualizarEstadoPasto(
    id: number,
    estado_pasto: EstadoPasto,
  ): Promise<Potrero> {
    const potrero = await this.findOne(id);
    potrero.estado_pasto = estado_pasto;
    return this.potreroRepository.save(potrero);
  }
}