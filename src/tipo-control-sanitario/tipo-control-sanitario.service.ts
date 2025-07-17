// src/tipo-control-sanitario/tipo-control-sanitario.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoControlSanitario } from './entities/tipo-control-sanitario.entity';
import { CreateTipoControlSanitarioDto } from './dto/create-tipo-control-sanitario.dto';
import { UpdateTipoControlSanitarioDto } from './dto/update-tipo-control-sanitario.dto';

@Injectable()
export class TipoControlSanitarioService {
  constructor(
    @InjectRepository(TipoControlSanitario)
    private tipo_control_sanitario_repository: Repository<TipoControlSanitario>,
  ) {}

  async crear(create_dto: CreateTipoControlSanitarioDto): Promise<TipoControlSanitario> {
    const nuevo_tipo = this.tipo_control_sanitario_repository.create(create_dto);
    return this.tipo_control_sanitario_repository.save(nuevo_tipo);
  }

  async obtener_todos(): Promise<TipoControlSanitario[]> {
    return this.tipo_control_sanitario_repository.find();
  }

  async obtener_por_id(id: number): Promise<TipoControlSanitario> {
    const tipo = await this.tipo_control_sanitario_repository.findOne({ where: { id } });
    if (!tipo) {
      throw new NotFoundException(`Tipo de control sanitario con ID ${id} no encontrado.`);
    }
    return tipo;
  }

  async actualizar(id: number, update_dto: UpdateTipoControlSanitarioDto): Promise<TipoControlSanitario> {
    const tipo = await this.obtener_por_id(id);
    Object.assign(tipo, update_dto);
    return this.tipo_control_sanitario_repository.save(tipo);
  }

  async eliminar(id: number): Promise<void> {
    const resultado = await this.tipo_control_sanitario_repository.softDelete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Tipo de control sanitario con ID ${id} no encontrado para eliminar.`);
    }
  }
}