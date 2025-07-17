// src/control-sanitario/control-sanitario.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ControlSanitario } from './entities/control-sanitario.entity';
import { CreateControlSanitarioDto } from './dto/create-control-sanitario.dto';
import { UpdateControlSanitarioDto } from './dto/update-control-sanitario.dto';
import { Animal } from '../animal/entities/animal.entity';
import { TipoControlSanitario } from '../tipo-control-sanitario/entities/tipo-control-sanitario.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class ControlSanitarioService {
  constructor(
    @InjectRepository(ControlSanitario)
    private control_sanitario_repository: Repository<ControlSanitario>,
    @InjectRepository(Animal)
    private animal_repository: Repository<Animal>,
    @InjectRepository(TipoControlSanitario)
    private tipo_control_repository: Repository<TipoControlSanitario>,
    @InjectRepository(Usuario)
    private usuario_repository: Repository<Usuario>,
  ) {}

  async crear(create_dto: CreateControlSanitarioDto): Promise<ControlSanitario> {
    const { animal_id, tipo_control_id, veterinario_id, ...control_data } = create_dto;

    const animal = await this.animal_repository.findOne({ where: { id: animal_id } });
    if (!animal) {
      throw new NotFoundException(`Animal con ID ${animal_id} no encontrado.`);
    }

    const tipo_control = await this.tipo_control_repository.findOne({ where: { id: tipo_control_id } });
    if (!tipo_control) {
      throw new NotFoundException(`Tipo de control sanitario con ID ${tipo_control_id} no encontrado.`);
    }

    const veterinario = await this.usuario_repository.findOne({ where: { id: veterinario_id } });
    if (!veterinario || veterinario.rol !== 'veterinario') {
      throw new BadRequestException(`Usuario con ID ${veterinario_id} no encontrado o no tiene rol de veterinario.`);
    }

    // Validaciones adicionales basadas en tipo_control
    if (tipo_control.aplica_a_sexo && tipo_control.aplica_a_sexo === (animal.sexo === 'Hembra')) {
        // Ejemplo: Si aplica a sexo pero el animal no coincide. Ajustar lógica según necesidad.
        // Podrías tener una lógica más específica aquí, por ejemplo si es castración y el animal es hembra.
    }

    if (tipo_control.requiere_medicamento && !control_data.medicamento) {
      throw new BadRequestException(`Este tipo de control sanitario requiere un medicamento.`);
    }


    const nuevo_control = this.control_sanitario_repository.create({
      ...control_data,
      animal,
      animal_id,
      tipo_control,
      tipo_control_id,
      veterinario,
      veterinario_id,
    });
    return this.control_sanitario_repository.save(nuevo_control);
  }

  async obtener_todos(): Promise<ControlSanitario[]> {
    return this.control_sanitario_repository.find({
      relations: ['animal', 'tipo_control', 'veterinario'],
    });
  }

  async obtener_por_id(id: number): Promise<ControlSanitario> {
    const control = await this.control_sanitario_repository.findOne({
      where: { id },
      relations: ['animal', 'tipo_control', 'veterinario'],
    });
    if (!control) {
      throw new NotFoundException(`Control sanitario con ID ${id} no encontrado.`);
    }
    return control;
  }

  async actualizar(id: number, update_dto: UpdateControlSanitarioDto): Promise<ControlSanitario> {
    const control = await this.obtener_por_id(id);

    // Lógica para actualizar relaciones si los IDs cambian
    if (update_dto.animal_id && update_dto.animal_id !== control.animal_id) {
      const new_animal = await this.animal_repository.findOne({ where: { id: update_dto.animal_id } });
      if (!new_animal) throw new NotFoundException(`Animal con ID ${update_dto.animal_id} no encontrado.`);
      control.animal = new_animal;
      control.animal_id = new_animal.id;
    }
    if (update_dto.tipo_control_id && update_dto.tipo_control_id !== control.tipo_control_id) {
      const new_tipo_control = await this.tipo_control_repository.findOne({ where: { id: update_dto.tipo_control_id } });
      if (!new_tipo_control) throw new NotFoundException(`Tipo de control con ID ${update_dto.tipo_control_id} no encontrado.`);
      control.tipo_control = new_tipo_control;
      control.tipo_control_id = new_tipo_control.id;
    }
    if (update_dto.veterinario_id && update_dto.veterinario_id !== control.veterinario_id) {
      const new_veterinario = await this.usuario_repository.findOne({ where: { id: update_dto.veterinario_id } });
      if (!new_veterinario || new_veterinario.rol !== 'veterinario') {
        throw new BadRequestException(`Usuario con ID ${update_dto.veterinario_id} no encontrado o no tiene rol de veterinario.`);
      }
      control.veterinario = new_veterinario;
      control.veterinario_id = new_veterinario.id;
    }

    Object.assign(control, update_dto);
    return this.control_sanitario_repository.save(control);
  }

  async eliminar(id: number): Promise<void> {
    const resultado = await this.control_sanitario_repository.softDelete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Control sanitario con ID ${id} no encontrado para eliminar.`);
    }
  }

  async obtener_controles_por_animal(animal_id: number): Promise<ControlSanitario[]> {
    const animal = await this.animal_repository.findOne({ where: { id: animal_id } });
    if (!animal) {
      throw new NotFoundException(`Animal con ID ${animal_id} no encontrado.`);
    }
    return this.control_sanitario_repository.find({
      where: { animal: { id: animal_id } },
      relations: ['tipo_control', 'veterinario'],
    });
  }
}