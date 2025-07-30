// src/cria/cria.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cria } from './entities/cria.entity';
import { Animal, SexoAnimal } from '../animal/entities/animal.entity'; // Importa SexoAnimal para validación
import { CreateCriaDto } from './dto/create-cria.dto'; // Asegúrate que este DTO ya no exija fecha_nacimiento
import { UpdateCriaDto } from './dto/update-cria.dto';

@Injectable()
export class CriaService {
  constructor(
    @InjectRepository(Cria)
    private cria_repository: Repository<Cria>,
    @InjectRepository(Animal)
    private animal_repository: Repository<Animal>,
  ) {}

  async crear(create_dto: CreateCriaDto): Promise<Cria> {
    // La fecha_nacimiento ahora pertenece a la entidad Animal, no a Cria.
    const { animal_id, madre_id, padre_id } = create_dto;

    const cria_animal = await this.animal_repository.findOne({ where: { id: animal_id } });
    if (!cria_animal) {
      throw new NotFoundException(`Animal (cría) con ID ${animal_id} no encontrado.`);
    }

    // Verificamos que el animal a registrar como cría ya existe
    const existe_cria_registrada = await this.cria_repository.findOne({ where: { cria_animal: { id: animal_id } } });
    if (existe_cria_registrada) {
      throw new ConflictException(`El animal con ID ${animal_id} ya está registrado como una cría.`);
    }

    const madre_animal = await this.animal_repository.findOne({ where: { id: madre_id } });
    if (!madre_animal || madre_animal.sexo !== SexoAnimal.HEMBRA) {
      throw new BadRequestException(`Animal (madre) con ID ${madre_id} no encontrado o no es hembra.`);
    }

    let padre_animal: Animal | null = null;
    if (padre_id) {
      padre_animal = await this.animal_repository.findOne({ where: { id: padre_id } });
      if (!padre_animal || padre_animal.sexo !== SexoAnimal.MACHO) {
        throw new BadRequestException(`Animal (padre) con ID ${padre_id} no encontrado o no es macho.`);
      }
    }

    // Creamos la cría usando las relaciones, sin los _id ni fecha_nacimiento
    const nueva_cria = this.cria_repository.create({
      cria_animal,
      madre: madre_animal,
      padre: padre_animal,
    });
    return this.cria_repository.save(nueva_cria);
  }

  async obtener_todos(): Promise<Cria[]> {
    return this.cria_repository.find({
      relations: ['cria_animal', 'madre', 'padre'],
    });
  }

  async obtener_por_id(id: number): Promise<Cria> {
    const cria = await this.cria_repository.findOne({
      where: { id },
      relations: ['cria_animal', 'madre', 'padre'],
    });
    if (!cria) {
      throw new NotFoundException(`Registro de cría con ID ${id} no encontrado.`);
    }
    return cria;
  }

  async actualizar(id: number, update_dto: UpdateCriaDto): Promise<Cria> {
    const cria = await this.obtener_por_id(id);

    if (update_dto.animal_id && update_dto.animal_id !== cria.animal_id) {
        throw new BadRequestException('El ID del animal (cría) no puede ser cambiado en un registro de cría existente.');
    }

    if (update_dto.madre_id && update_dto.madre_id !== cria.madre_id) {
      const nueva_madre = await this.animal_repository.findOne({ where: { id: update_dto.madre_id } });
      if (!nueva_madre || nueva_madre.sexo !== SexoAnimal.HEMBRA) { // Usar enum
        throw new BadRequestException(`Nueva madre con ID ${update_dto.madre_id} no válida o no es hembra.`);
      }
      cria.madre = nueva_madre;
      cria.madre_id = nueva_madre.id;
    }

    // <-- CAMBIO AQUÍ: Asegurar que se permite null
    if (update_dto.padre_id !== undefined && update_dto.padre_id !== cria.padre_id) {
      if (update_dto.padre_id === null) {
        cria.padre = null; // Asignar null
        cria.padre_id = null; // Asignar null
      } else {
        const nuevo_padre = await this.animal_repository.findOne({ where: { id: update_dto.padre_id } });
        if (!nuevo_padre || nuevo_padre.sexo !== SexoAnimal.MACHO) { // Usar enum
          throw new BadRequestException(`Nuevo padre con ID ${update_dto.padre_id} no válido o no es macho.`);
        }
        cria.padre = nuevo_padre;
        cria.padre_id = nuevo_padre.id;
      }
    }

    Object.assign(cria, update_dto);
    return this.cria_repository.save(cria);
  }

  async eliminar(id: number): Promise<void> {
    const resultado = await this.cria_repository.softDelete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Registro de cría con ID ${id} no encontrado para eliminar.`);
    }
  }

  async obtener_crias_por_madre(madre_id: number): Promise<Cria[]> {
    const madre = await this.animal_repository.findOne({ where: { id: madre_id } });
    if (!madre) {
      throw new NotFoundException(`Animal (madre) con ID ${madre_id} no encontrado.`);
    }
    return this.cria_repository.find({
      where: { madre: { id: madre_id } },
      relations: ['cria_animal', 'padre'],
    });
  }

  async obtener_crias_por_padre(padre_id: number): Promise<Cria[]> {
    const padre = await this.animal_repository.findOne({ where: { id: padre_id } });
    if (!padre) {
      throw new NotFoundException(`Animal (padre) con ID ${padre_id} no encontrado.`);
    }
    return this.cria_repository.find({
      where: { padre: { id: padre_id } },
      relations: ['cria_animal', 'madre'],
    });
  }
}