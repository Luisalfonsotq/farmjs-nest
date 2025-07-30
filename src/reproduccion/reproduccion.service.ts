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
    // 🐮 ⬅️ CAMBIO: Desestructurar madre_id y padre_id
    const { madre_id, padre_id, ...reproduccion_data } = create_dto;

    const madre = await this.animal_repository.findOne({ where: { id: madre_id } });
    if (!madre) {
      throw new NotFoundException(`Animal (madre) con ID ${madre_id} no encontrado.`);
    }
    if (madre.sexo !== SexoAnimal.HEMBRA) {
      throw new BadRequestException('El animal asignado como madre debe ser hembra.');
    }

    let padre: Animal | null = null;
    // 🐮 ⬅️ CAMBIO: Usar padre_id
    if (padre_id !== null && padre_id !== undefined) { // Verificar si padre_id fue proporcionado y no es null
      padre = await this.animal_repository.findOne({ where: { id: padre_id } });
      if (!padre) {
        throw new NotFoundException(`Animal (padre/toro) con ID ${padre_id} no encontrado.`);
      }
      if (padre.sexo !== SexoAnimal.MACHO) {
        throw new BadRequestException('El animal asignado como padre debe ser macho.');
      }
    }

    // 🐮 ⬅️ CAMBIO: Usar madre y padre, y sus IDs correspondientes
    const nueva_reproduccion = this.reproduccion_repository.create({
      ...reproduccion_data,
      madre,
      madre_id,
      padre,
      padre_id,
    });
    // 🐮 ⬅️ CAMBIO: Añadir 'await' para asegurar el tipo de retorno
    return await this.reproduccion_repository.save(nueva_reproduccion);
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

    // 🐮 ⬅️ CAMBIO: Usar madre_id
    if (update_dto.madre_id !== undefined && update_dto.madre_id !== reproduccion.madre_id) {
      const nueva_madre = await this.animal_repository.findOne({ where: { id: update_dto.madre_id } });
      if (!nueva_madre || nueva_madre.sexo !== SexoAnimal.HEMBRA) {
        throw new BadRequestException(`Animal (madre) con ID ${update_dto.madre_id} no válido o no es hembra.`);
      }
      reproduccion.madre = nueva_madre;
      reproduccion.madre_id = nueva_madre.id;
    }

    // 🐮 ⬅️ CAMBIO: Usar padre_id
    if (update_dto.padre_id !== undefined && update_dto.padre_id !== reproduccion.padre_id) {
      if (update_dto.padre_id === null) {
        reproduccion.padre = null;
        reproduccion.padre_id = null;
      } else {
        const nuevo_padre = await this.animal_repository.findOne({ where: { id: update_dto.padre_id } });
        if (!nuevo_padre || nuevo_padre.sexo !== SexoAnimal.MACHO) {
          throw new BadRequestException(`Animal (padre/toro) con ID ${update_dto.padre_id} no válido o no es macho.`);
        }
        reproduccion.padre = nuevo_padre;
        reproduccion.padre_id = nuevo_padre.id;
      }
    }

    Object.assign(reproduccion, update_dto);
    return await this.reproduccion_repository.save(reproduccion); // 🐮 ⬅️ Añadir 'await'
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