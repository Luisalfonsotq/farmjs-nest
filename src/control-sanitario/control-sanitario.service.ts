// src/control-sanitario/control-sanitario.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ControlSanitario } from './entities/control-sanitario.entity';
import { CreateControlSanitarioDto } from './dto/create-control-sanitario.dto';
import { UpdateControlSanitarioDto } from './dto/update-control-sanitario.dto';
import { Animal } from '../animal/entities/animal.entity';
import { Usuario, RolUsuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class ControlSanitarioService {
  constructor(
    @InjectRepository(ControlSanitario)
    private control_repository: Repository<ControlSanitario>,
    @InjectRepository(Animal)
    private animal_repository: Repository<Animal>,
    @InjectRepository(Usuario)
    private usuario_repository: Repository<Usuario>,
  ) { }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  /** Puebla tipo_control virtual para compatibilidad con el frontend.
   *  El frontend existente lee: control.tipo_control?.nombre
   */
  private poblar(control: ControlSanitario): ControlSanitario {
    control.tipo_control = {
      nombre: control.nombre_control,
      categoria: control.categoria_control,
    };
    return control;
  }

  private async validar_animal(id: number): Promise<Animal> {
    const animal = await this.animal_repository.findOne({ where: { id } });
    if (!animal) throw new NotFoundException(`Animal con ID ${id} no encontrado.`);
    return animal;
  }

  private async validar_veterinario(id: number): Promise<Usuario> {
    const vet = await this.usuario_repository.findOne({ where: { id } });
    if (!vet) throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    if (vet.rol !== RolUsuario.VETERINARIO) {
      throw new BadRequestException(`El usuario con ID ${id} no tiene rol de veterinario.`);
    }
    return vet;
  }

  private agrupar_por_tipo(controles: ControlSanitario[]): { nombre: string; cantidad: number }[] {
    const mapa: Record<string, number> = {};
    for (const c of controles) {
      const nombre = c.nombre_control || 'Sin tipo';
      mapa[nombre] = (mapa[nombre] || 0) + 1;
    }
    return Object.entries(mapa).map(([nombre, cantidad]) => ({ nombre, cantidad }));
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async crear(dto: CreateControlSanitarioDto): Promise<ControlSanitario> {
    const { animal_id, veterinario_id, nombre_control, categoria_control, ...resto } = dto;

    const animal = await this.validar_animal(animal_id);

    let veterinario: Usuario | null = null;
    if (veterinario_id != null) {
      veterinario = await this.validar_veterinario(veterinario_id);
    }

    // Creamos sin relaciones para evitar conflictos con DeepPartial
    const control = this.control_repository.create({
      ...resto,
      animal_id,
      nombre_control: nombre_control.trim(),
      categoria_control: categoria_control?.trim() ?? null,
      veterinario_id: veterinario?.id ?? null,
    });
    // Asignamos relaciones después del create
    control.animal = animal;
    control.veterinario = veterinario;

    const guardado = await this.control_repository.save(control);
    return this.poblar(guardado);
  }

  async obtener_todos(): Promise<ControlSanitario[]> {
    const lista = await this.control_repository.find({
      relations: ['animal', 'veterinario'],
      order: { fecha: 'DESC' },
    });
    return lista.map(c => this.poblar(c));
  }

  async obtener_por_id(id: number): Promise<ControlSanitario> {
    const control = await this.control_repository.findOne({
      where: { id },
      relations: ['animal', 'veterinario'],
    });
    if (!control) throw new NotFoundException(`Control sanitario con ID ${id} no encontrado.`);
    return this.poblar(control);
  }

  async actualizar(id: number, dto: UpdateControlSanitarioDto): Promise<ControlSanitario> {
    const control = await this.obtener_por_id(id);

    if (dto.animal_id != null && dto.animal_id !== control.animal_id) {
      control.animal = await this.validar_animal(dto.animal_id);
      control.animal_id = dto.animal_id;
    }

    if (dto.veterinario_id !== undefined) {
      if (dto.veterinario_id === null) {
        control.veterinario = null;
        control.veterinario_id = null;
      } else if (dto.veterinario_id !== control.veterinario_id) {
        control.veterinario = await this.validar_veterinario(dto.veterinario_id);
        control.veterinario_id = dto.veterinario_id;
      }
    }

    if (dto.nombre_control != null) control.nombre_control = dto.nombre_control.trim();
    if (dto.categoria_control !== undefined) control.categoria_control = dto.categoria_control?.trim() ?? null;
    if (dto.fecha != null) control.fecha = dto.fecha;
    if (dto.medicamento !== undefined) control.medicamento = dto.medicamento?.trim() ?? null;
    if (dto.dosis !== undefined) control.dosis = dto.dosis ?? null;
    if (dto.via_aplicacion !== undefined) control.via_aplicacion = dto.via_aplicacion ?? null;
    if (dto.observaciones !== undefined) control.observaciones = dto.observaciones?.trim() ?? null;
    if (dto.costo !== undefined) control.costo = dto.costo ?? null;

    const guardado = await this.control_repository.save(control);
    return this.poblar(guardado);
  }

  async eliminar(id: number): Promise<void> {
    const resultado = await this.control_repository.softDelete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Control sanitario con ID ${id} no encontrado.`);
    }
  }

  // ─── Queries especializadas ───────────────────────────────────────────────

  async obtener_controles_por_animal(animal_id: number): Promise<ControlSanitario[]> {
    await this.validar_animal(animal_id);
    const lista = await this.control_repository.find({
      where: { animal_id },
      relations: ['veterinario'],
      order: { fecha: 'DESC' },
    });
    return lista.map(c => this.poblar(c));
  }

  async obtener_historial_animal(animal_id: number): Promise<any> {
    const animal = await this.animal_repository.findOne({
      where: { id: animal_id },
      relations: ['finca'],
    });
    if (!animal) throw new NotFoundException(`Animal con ID ${animal_id} no encontrado.`);

    const controles = await this.control_repository.find({
      where: { animal_id },
      relations: ['veterinario'],
      order: { fecha: 'DESC' },
    });
    const mapeados = controles.map(c => this.poblar(c));

    return {
      animal,
      total_controles: mapeados.length,
      ultimo_control: mapeados[0] ?? null,
      controles_por_tipo: this.agrupar_por_tipo(mapeados),
      costo_total: mapeados.reduce((sum, c) => sum + (Number(c.costo) || 0), 0),
      historial: mapeados,
    };
  }

  async obtener_estadisticas_veterinario(
    veterinario_id: number,
    mes?: number,
    anio?: number,
  ): Promise<any> {
    const ahora = new Date();
    const fechaInicio = mes && anio
      ? new Date(anio, mes - 1, 1)
      : new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + 1);

    const controles = await this.control_repository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.animal', 'animal')
      .where('c.veterinario_id = :veterinario_id', { veterinario_id })
      .andWhere('c.fecha >= :fechaInicio', { fechaInicio })
      .andWhere('c.fecha < :fechaFin', { fechaFin })
      .getMany();

    return {
      total_controles: controles.length,
      animales_atendidos: new Set(controles.map(c => c.animal_id)).size,
      controles_hoy: controles.filter(
        c => new Date(c.fecha).toDateString() === ahora.toDateString()
      ).length,
      por_tipo: this.agrupar_por_tipo(controles),
      costo_total: controles.reduce((sum, c) => sum + (Number(c.costo) || 0), 0),
    };
  }

  async obtener_proximas_vacunaciones(dias: number = 30): Promise<any[]> {
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + dias);

    const vacunas = await this.control_repository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.animal', 'animal')
      .where('LOWER(c.nombre_control) LIKE :v', { v: '%vacun%' })
      .orderBy('c.fecha', 'DESC')
      .getMany();

    const tipos = [...new Set(vacunas.map(c => c.nombre_control))];
    const resultado: { tipo: string; cantidad_animales: number; urgente: boolean }[] = [];

    for (const tipo of tipos) {
      const del_tipo = vacunas.filter(c => c.nombre_control === tipo);
      const pendientes = del_tipo.filter(c => {
        const prox = new Date(c.fecha);
        prox.setDate(prox.getDate() + 120); // fiebre aftosa cada 4 meses
        return prox <= fechaLimite;
      });
      if (pendientes.length > 0) {
        resultado.push({
          tipo,
          cantidad_animales: pendientes.length,
          urgente: pendientes.some(c => {
            const prox = new Date(c.fecha);
            prox.setDate(prox.getDate() + 120);
            return prox <= new Date(hoy.getTime() + 7 * 86_400_000);
          }),
        });
      }
    }

    return resultado;
  }
}