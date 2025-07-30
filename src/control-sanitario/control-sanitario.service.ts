// src/control-sanitario/control-sanitario.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ControlSanitario } from './entities/control-sanitario.entity';
import { CreateControlSanitarioDto } from './dto/create-control-sanitario.dto';
import { UpdateControlSanitarioDto } from './dto/update-control-sanitario.dto';
import { Animal } from '../animal/entities/animal.entity';
import { TipoControlSanitario } from '../tipo-control-sanitario/entities/tipo-control-sanitario.entity';
import { Usuario, RolUsuario } from '../usuario/entities/usuario.entity'; // 🐮 ¡IMPORTA RolUsuario!

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

    let veterinario: Usuario | null = null;
    // 🐮 ⬅️ CORRECCIÓN 1: Manejar veterinario_id que puede ser null o undefined
    if (veterinario_id !== null && veterinario_id !== undefined) {
      veterinario = await this.usuario_repository.findOne({ where: { id: veterinario_id } });
      if (!veterinario) {
        throw new NotFoundException(`Usuario con ID ${veterinario_id} no encontrado.`);
      }
      // 🐮 ⬅️ CORRECCIÓN 2: Comparar con el enum RolUsuario
      if (veterinario.rol !== RolUsuario.VETERINARIO) {
        throw new BadRequestException(`Usuario con ID ${veterinario_id} no tiene rol de veterinario.`);
      }
    } else {
      // Si veterinario_id es null/undefined y es obligatorio para el control, lanza un error
      // O permite que sea null si tu lógica de negocio lo permite
      // Por ahora, si es null/undefined, simplemente no se asigna un veterinario.
    }

    // Validaciones adicionales basadas en tipo_control
    if (tipo_control.aplica_a_sexo && animal.sexo === 'Hembra') { // Ejemplo de lógica, revisar si es la intención
        // Si aplica a sexo y el animal es hembra, podría haber una validación específica aquí.
        // La comparación `tipo_control.aplica_a_sexo === (animal.sexo === 'Hembra')` es válida,
        // pero la lógica de negocio puede necesitar más detalle.
    }

    // 🐮 ⬅️ CORRECCIÓN 3: Usar 'medicamento_dosis' en lugar de 'medicamento'
    if (tipo_control.requiere_medicamento && (!control_data.medicamento_dosis || control_data.medicamento_dosis.trim() === '')) {
      throw new BadRequestException(`Este tipo de control sanitario requiere un medicamento y dosis.`);
    }


    const nuevo_control = this.control_sanitario_repository.create({
      ...control_data,
      animal,
      animal_id,
      tipo_control,
      tipo_control_id,
      veterinario, // Puede ser null
      veterinario_id, // Puede ser null
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
    if (update_dto.animal_id !== undefined && update_dto.animal_id !== control.animal_id) {
      const new_animal = await this.animal_repository.findOne({ where: { id: update_dto.animal_id } });
      if (!new_animal) throw new NotFoundException(`Animal con ID ${update_dto.animal_id} no encontrado.`);
      control.animal = new_animal;
      control.animal_id = new_animal.id;
    }
    if (update_dto.tipo_control_id !== undefined && update_dto.tipo_control_id !== control.tipo_control_id) {
      const new_tipo_control = await this.tipo_control_repository.findOne({ where: { id: update_dto.tipo_control_id } });
      if (!new_tipo_control) throw new NotFoundException(`Tipo de control con ID ${update_dto.tipo_control_id} no encontrado.`);
      control.tipo_control = new_tipo_control;
      control.tipo_control_id = new_tipo_control.id;
    }

    // 🐮 ⬅️ CORRECCIÓN 1 y 2 (en actualizar): Manejar veterinario_id que puede ser null/undefined y comparar con enum
    if (update_dto.veterinario_id !== undefined) {
      if (update_dto.veterinario_id === null) {
        control.veterinario = null;
        control.veterinario_id = null;
      } else if (update_dto.veterinario_id !== control.veterinario_id) {
        const new_veterinario = await this.usuario_repository.findOne({ where: { id: update_dto.veterinario_id } });
        if (!new_veterinario) {
          throw new NotFoundException(`Usuario con ID ${update_dto.veterinario_id} no encontrado.`);
        }
        // 🐮 ⬅️ CORRECCIÓN 2 (en actualizar): Comparar con el enum RolUsuario
        if (new_veterinario.rol !== RolUsuario.VETERINARIO) {
          throw new BadRequestException(`Usuario con ID ${update_dto.veterinario_id} no tiene rol de veterinario.`);
        }
        control.veterinario = new_veterinario;
        control.veterinario_id = new_veterinario.id;
      }
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