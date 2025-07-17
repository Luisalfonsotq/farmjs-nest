// src/proveedor/proveedor.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedor_repository: Repository<Proveedor>,
  ) {}

  async crear(create_proveedor_dto: CreateProveedorDto): Promise<Proveedor> {
    const nuevo_proveedor = this.proveedor_repository.create(create_proveedor_dto);
    return this.proveedor_repository.save(nuevo_proveedor);
  }

  async obtener_todos(): Promise<Proveedor[]> {
    return this.proveedor_repository.find();
  }

  async obtener_por_id(id: number): Promise<Proveedor> {
    const proveedor = await this.proveedor_repository.findOne({ where: { id } });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado.`);
    }
    return proveedor;
  }

  async actualizar(id: number, update_proveedor_dto: UpdateProveedorDto): Promise<Proveedor> {
    const proveedor = await this.obtener_por_id(id);
    Object.assign(proveedor, update_proveedor_dto);
    return this.proveedor_repository.save(proveedor);
  }

  async eliminar(id: number): Promise<void> {
    const resultado = await this.proveedor_repository.softDelete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado para eliminar.`);
    }
  }
}