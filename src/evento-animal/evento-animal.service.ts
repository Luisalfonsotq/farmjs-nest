// src/evento-animal/evento-animal.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoAnimal } from './entities/evento-animal.entity';
import { CreateEventoAnimalDto } from './dto/create-evento-animal.dto';
import { UpdateEventoAnimalDto } from './dto/update-evento-animal.dto';
import { Animal } from '../animal/entities/animal.entity';
import { TipoEventoAnimal } from '../tipo-evento-animal/entities/tipo-evento-animal.entity';
import { Potrero } from '../potrero/entities/potrero.entity';

@Injectable()
export class EventoAnimalService {
  constructor(
    @InjectRepository(EventoAnimal)
    private evento_animal_repository: Repository<EventoAnimal>,
    @InjectRepository(Animal)
    private animal_repository: Repository<Animal>,
    @InjectRepository(TipoEventoAnimal)
    private tipo_evento_repository: Repository<TipoEventoAnimal>,
    @InjectRepository(Potrero)
    private potrero_repository: Repository<Potrero>,
  ) { }

  async crear(create_dto: CreateEventoAnimalDto): Promise<EventoAnimal> {
    const { animal_id, tipo_evento_id, potrero_anterior_id, potrero_actual_id, ...evento_data } = create_dto;

    const animal = await this.animal_repository.findOne({ where: { id: animal_id } });
    if (!animal) {
      throw new NotFoundException(`Animal con ID ${animal_id} no encontrado.`);
    }

    const tipo_evento = await this.tipo_evento_repository.findOne({ where: { id: tipo_evento_id } });
    if (!tipo_evento) {
      throw new NotFoundException(`Tipo de evento con ID ${tipo_evento_id} no encontrado.`);
    }

    let potrero_anterior: Potrero | null = null;
    if (potrero_anterior_id) {
      potrero_anterior = await this.potrero_repository.findOne({ where: { id: potrero_anterior_id } });
      if (!potrero_anterior) {
        throw new NotFoundException(`Potrero anterior con ID ${potrero_anterior_id} no encontrado.`);
      }
    }

    let potrero_actual: Potrero | null = null;
    if (potrero_actual_id) {
      potrero_actual = await this.potrero_repository.findOne({ where: { id: potrero_actual_id } });
      if (!potrero_actual) {
        throw new NotFoundException(`Potrero actual con ID ${potrero_actual_id} no encontrado.`);
      }
    }

    // Lógica específica para "Cambio de Potrero"
    if (tipo_evento.nombre === 'Cambio de Potrero') {
      if (!potrero_anterior_id || !potrero_actual_id) {
        throw new BadRequestException('Para un "Cambio de Potrero", los IDs de potrero anterior y actual son obligatorios.');
      }
      if (potrero_anterior_id === potrero_actual_id) {
        throw new BadRequestException('El potrero anterior y el actual no pueden ser el mismo para un "Cambio de Potrero".');
      }
      // Opcional: Actualizar el potrero actual del animal si es un evento de cambio de potrero
      animal.potrero = potrero_actual;
      // <-- CAMBIO AQUÍ: Asegurar que potrero_actual no es null antes de acceder a .id
      animal.potrero_id = potrero_actual ? potrero_actual.id : null;
      await this.animal_repository.save(animal);
    }

    // Lógica para eventos de "Baja" o "Muerte" y otros que implican salida del animal
    const tipos_salida = ['baja', 'muerte', 'venta', 'sacrificio', 'robo', 'hurto', 'donación', 'desaparición', 'siniestro', 'reclamo'];
    if (tipos_salida.some(t => tipo_evento.nombre.toLowerCase().includes(t))) {
      await this.animal_repository.softDelete(animal_id);
    }
    // Opcional: Para el evento "Pesaje", el valor_medida es obligatorio.
    if (tipo_evento.nombre === 'Pesaje' && (evento_data.valor_medida === undefined || evento_data.valor_medida === null)) {
      throw new BadRequestException('Para un evento de "Pesaje", el campo "valor_medida" (peso) es obligatorio.');
    }


    const nuevo_evento = this.evento_animal_repository.create({
      ...evento_data,
      animal,
      animal_id,
      tipo_evento,
      tipo_evento_id,
      potrero_anterior,
      potrero_anterior_id,
      potrero_actual,
      potrero_actual_id,
    });
    return this.evento_animal_repository.save(nuevo_evento);
  }

  async obtener_todos(): Promise<EventoAnimal[]> {
    return this.evento_animal_repository.find({
      relations: ['animal', 'tipo_evento', 'potrero_anterior', 'potrero_actual'],
    });
  }

  async obtener_por_id(id: number): Promise<EventoAnimal> {
    const evento = await this.evento_animal_repository.findOne({
      where: { id },
      relations: ['animal', 'tipo_evento', 'potrero_anterior', 'potrero_actual'],
    });
    if (!evento) {
      throw new NotFoundException(`Evento de animal con ID ${id} no encontrado.`);
    }
    return evento;
  }

  async actualizar(id: number, update_dto: UpdateEventoAnimalDto): Promise<EventoAnimal> {
    const evento = await this.obtener_por_id(id);

    if (update_dto.animal_id && update_dto.animal_id !== evento.animal_id) {
      const new_animal = await this.animal_repository.findOne({ where: { id: update_dto.animal_id } });
      if (!new_animal) throw new NotFoundException(`Animal con ID ${update_dto.animal_id} no encontrado.`);
      evento.animal = new_animal;
      evento.animal_id = new_animal.id;
    }

    if (update_dto.tipo_evento_id && update_dto.tipo_evento_id !== evento.tipo_evento_id) {
      const new_tipo_evento = await this.tipo_evento_repository.findOne({ where: { id: update_dto.tipo_evento_id } });
      if (!new_tipo_evento) throw new NotFoundException(`Tipo de evento con ID ${update_dto.tipo_evento_id} no encontrado.`);
      evento.tipo_evento = new_tipo_evento;
      evento.tipo_evento_id = new_tipo_evento.id;
    }

    // <-- CAMBIO AQUÍ: Asegurar que se permite null para potrero_anterior
    if (update_dto.potrero_anterior_id !== undefined && update_dto.potrero_anterior_id !== evento.potrero_anterior_id) {
      if (update_dto.potrero_anterior_id === null) {
        evento.potrero_anterior = null; // Asignar null
        evento.potrero_anterior_id = null; // Asignar null
      } else {
        const new_potrero = await this.potrero_repository.findOne({ where: { id: update_dto.potrero_anterior_id } });
        if (!new_potrero) throw new NotFoundException(`Potrero anterior con ID ${update_dto.potrero_anterior_id} no encontrado.`);
        evento.potrero_anterior = new_potrero;
        evento.potrero_anterior_id = new_potrero.id;
      }
    }

    // <-- CAMBIO AQUÍ: Asegurar que se permite null para potrero_actual
    if (update_dto.potrero_actual_id !== undefined && update_dto.potrero_actual_id !== evento.potrero_actual_id) {
      if (update_dto.potrero_actual_id === null) {
        evento.potrero_actual = null; // Asignar null
        evento.potrero_actual_id = null; // Asignar null
      } else {
        const new_potrero = await this.potrero_repository.findOne({ where: { id: update_dto.potrero_actual_id } });
        if (!new_potrero) throw new NotFoundException(`Potrero actual con ID ${update_dto.potrero_actual_id} no encontrado.`);
        evento.potrero_actual = new_potrero;
        evento.potrero_actual_id = new_potrero.id;
      }
    }

    // Validaciones de tipo de evento al actualizar
    if (evento.tipo_evento.nombre === 'Cambio de Potrero') {
      if (update_dto.potrero_anterior_id === undefined || update_dto.potrero_actual_id === undefined) {
        throw new BadRequestException('Para un "Cambio de Potrero", los IDs de potrero anterior y actual son obligatorios.');
      }
      if (update_dto.potrero_anterior_id === update_dto.potrero_actual_id) {
        throw new BadRequestException('El potrero anterior y el actual no pueden ser el mismo para un "Cambio de Potrero".');
      }
    }
    if (evento.tipo_evento.nombre === 'Pesaje' && (update_dto.valor_medida === undefined || update_dto.valor_medida === null)) {
      throw new BadRequestException('Para un evento de "Pesaje", el campo "valor_medida" (peso) es obligatorio.');
    }


    Object.assign(evento, update_dto);
    return this.evento_animal_repository.save(evento);
  }

  async eliminar(id: number): Promise<void> {
    const resultado = await this.evento_animal_repository.softDelete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Evento de animal con ID ${id} no encontrado para eliminar.`);
    }
  }

  async obtener_eventos_por_animal(animal_id: number): Promise<EventoAnimal[]> {
    const animal = await this.animal_repository.findOne({ where: { id: animal_id } });
    if (!animal) {
      throw new NotFoundException(`Animal con ID ${animal_id} no encontrado.`);
    }
    return this.evento_animal_repository.find({
      where: { animal: { id: animal_id } },
      relations: ['tipo_evento', 'potrero_anterior', 'potrero_actual'],
    });
  }
}