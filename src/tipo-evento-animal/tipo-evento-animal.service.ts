// src/tipo-evento-animal/tipo-evento-animal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoEventoAnimal } from './entities/tipo-evento-animal.entity';
import { CreateTipoEventoAnimalDto } from './dto/create-tipo-evento-animal.dto';
import { UpdateTipoEventoAnimalDto } from './dto/update-tipo-evento-animal.dto';

@Injectable()
export class TipoEventoAnimalService {
  constructor(
    @InjectRepository(TipoEventoAnimal)
    private tipo_evento_animal_repository: Repository<TipoEventoAnimal>,
  ) {}

  async crear(create_dto: CreateTipoEventoAnimalDto): Promise<TipoEventoAnimal> {
    const nuevo_tipo_evento = this.tipo_evento_animal_repository.create(create_dto);
    return this.tipo_evento_animal_repository.save(nuevo_tipo_evento);
  }

  async obtener_todos(): Promise<TipoEventoAnimal[]> {
    return this.tipo_evento_animal_repository.find();
  }

  async obtener_por_id(id: number): Promise<TipoEventoAnimal> {
    const tipo_evento = await this.tipo_evento_animal_repository.findOne({ where: { id } });
    if (!tipo_evento) {
      throw new NotFoundException(`Tipo de evento de animal con ID ${id} no encontrado.`);
    }
    return tipo_evento;
  }

  async actualizar(id: number, update_dto: UpdateTipoEventoAnimalDto): Promise<TipoEventoAnimal> {
    const tipo_evento = await this.obtener_por_id(id);
    Object.assign(tipo_evento, update_dto);
    return this.tipo_evento_animal_repository.save(tipo_evento);
  }

  async eliminar(id: number): Promise<void> {
    const resultado = await this.tipo_evento_animal_repository.softDelete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Tipo de evento de animal con ID ${id} no encontrado para eliminar.`);
    }
  }
}