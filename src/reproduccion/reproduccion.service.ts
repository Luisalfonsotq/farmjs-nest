// src/reproduccion/reproduccion.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reproduccion, TipoMonta } from './entities/reproduccion.entity';
import { Animal, SexoAnimal } from '../animal/entities/animal.entity'; // Importa SexoAnimal
import { CreateReproduccionDto } from './dto/create-reproduccion.dto';
import { UpdateReproduccionDto } from './dto/update-reproduccion.dto';

@Injectable()
export class ReproduccionService {
  constructor(
    @InjectRepository(Reproduccion)
    private reproduccion_repository: Repository<Reproduccion>,
    @InjectRepository(Animal)
    private animal_repository: Repository<Animal>,
  ) {}

  async crear(create_dto: CreateReproduccionDto): Promise<Reproduccion> {
    const { animal_id, toro_id, ...reproduccion_data } = create_dto;

    const madre = await this.animal_repository.findOne({ where: { id: animal_id } });
    if (!madre) {
      throw new NotFoundException(`Animal (madre) con ID ${animal_id} no encontrado.`);
    }
    if (madre.sexo !== SexoAnimal.HEMBRA) { // Usar enum
      throw new BadRequestException('El animal asignado como madre debe ser hembra.');
    }

    let padre: Animal | null = null;
    if (toro_id) {
      padre = await this.animal_repository.findOne({ where: { id: toro_id } });
      if (!padre) {
        throw new NotFoundException(`Animal (padre/toro) con ID ${toro_id} no encontrado.`);
      }
      if (padre.sexo !== SexoAnimal.MACHO) { // Usar enum
        throw new BadRequestException('El animal asignado como padre debe ser macho.');
      }
    }

    const nueva_reproduccion = this.reproduccion_repository.create({
      ...reproduccion_data,
      madre,
      animal_id,
      padre, // <-- CAMBIO AQUÍ: padre puede ser null
      toro_id, // <-- CAMBIO AQUÍ: toro_id puede ser null
    });
    return this.reproduccion_repository.save(nueva_reproduccion);
  }

  async obtener_todos(): Promise<Reproduccion[]> {
    return this.reproduccion_repository.find({
      relations: ['madre', 'padre'],
    });
  }

  async obtener_por_id(id: number): Promise<Reproduccion> {
    const reproduccion = await this.reproduccion_repository.findOne({
      where: { id },
      relations: ['madre', 'padre'],
    });
    if (!reproduccion) {
      throw new NotFoundException(`Registro de reproducción con ID ${id} no encontrado.`);
    }
    return reproduccion;
  }

  async actualizar(id: number, update_dto: UpdateReproduccionDto): Promise<Reproduccion> {
    const reproduccion = await this.obtener_por_id(id);

    if (update_dto.animal_id && update_dto.animal_id !== reproduccion.animal_id) {
      const nueva_madre = await this.animal_repository.findOne({ where: { id: update_dto.animal_id } });
      if (!nueva_madre || nueva_madre.sexo !== SexoAnimal.HEMBRA) { // Usar enum
        throw new BadRequestException(`Animal (madre) con ID ${update_dto.animal_id} no válido o no es hembra.`);
      }
      reproduccion.madre = nueva_madre;
      reproduccion.animal_id = nueva_madre.id;
    }

    // <-- CAMBIO AQUÍ: Asegurar que se permite null para padre/toro
    if (update_dto.toro_id !== undefined && update_dto.toro_id !== reproduccion.toro_id) {
      if (update_dto.toro_id === null) {
        reproduccion.padre = null; // Asignar null
        reproduccion.toro_id = null; // Asignar null
      } else {
        const nuevo_padre = await this.animal_repository.findOne({ where: { id: update_dto.toro_id } });
        if (!nuevo_padre || nuevo_padre.sexo !== SexoAnimal.MACHO) { // Usar enum
          throw new BadRequestException(`Animal (padre/toro) con ID ${update_dto.toro_id} no válido o no es macho.`);
        }
        reproduccion.padre = nuevo_padre;
        reproduccion.toro_id = nuevo_padre.id;
      }
    }

    Object.assign(reproduccion, update_dto);
    return this.reproduccion_repository.save(reproduccion);
  }

  async eliminar(id: number): Promise<void> {
    const resultado = await this.reproduccion_repository.softDelete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Registro de reproducción con ID ${id} no encontrado para eliminar.`);
    }
  }

  async obtener_reproducciones_por_madre(madre_id: number): Promise<Reproduccion[]> {
    const madre = await this.animal_repository.findOne({ where: { id: madre_id } });
    if (!madre) {
      throw new NotFoundException(`Animal (madre) con ID ${madre_id} no encontrado.`);
    }
    return this.reproduccion_repository.find({
      where: { madre: { id: madre_id } },
      relations: ['padre'],
    });
  }
}