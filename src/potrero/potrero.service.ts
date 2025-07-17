// src/potrero/potrero.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Potrero } from './entities/potrero.entity';
import { Finca } from '../finca/entities/finca.entity'; // Importar Finca
import { CreatePotreroDto } from './dto/create-potrero.dto';
import { UpdatePotreroDto } from './dto/update-potrero.dto';

@Injectable()
export class PotreroService {
  constructor(
    @InjectRepository(Potrero)
    private potreroRepository: Repository<Potrero>,
    @InjectRepository(Finca) // Inyectar repositorio de Finca para validación
    private fincaRepository: Repository<Finca>,
  ) {}

  async create(createPotreroDto: CreatePotreroDto): Promise<Potrero> {
    const { finca_id, ...potreroData } = createPotreroDto;

    const finca = await this.fincaRepository.findOne({ where: { id: finca_id } });
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${finca_id} no encontrada.`);
    }

    const newPotrero = this.potreroRepository.create({
      ...potreroData,
      finca: finca, // Asigna el objeto Finca
      finca_id: finca.id, // También guarda la FK directamente
    });
    return this.potreroRepository.save(newPotrero);
  }

  async findAll(): Promise<Potrero[]> {
    return this.potreroRepository.find({ relations: ['finca'] });
  }

  async findOne(id: number): Promise<Potrero> {
    const potrero = await this.potreroRepository.findOne({
      where: { id },
      relations: ['finca', 'animales'], // Incluir animales en el potrero
    });
    if (!potrero) {
      throw new NotFoundException(`Potrero con ID ${id} no encontrado.`);
    }
    return potrero;
  }

  async update(id: number, updatePotreroDto: UpdatePotreroDto): Promise<Potrero> {
    const potrero = await this.findOne(id); // Reutiliza findOne para verificar existencia

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
    // Considerar lógica de si hay animales en el potrero antes de eliminar
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
    return this.potreroRepository.find({ where: { finca: { id: fincaId } }, relations: ['animales'] });
  }
}