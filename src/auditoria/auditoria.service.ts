import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria, AccionAuditoria } from './entities/auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepo: Repository<Auditoria>,
  ) { }

  async createLog(
    usuario_id: number,
    finca_id: number,
    accion: AccionAuditoria,
    entidad: string,
    entidad_id: number | null,
    detalles?: any,
    ip_address?: string,
  ): Promise<Auditoria> {
    const log = this.auditoriaRepo.create({
      usuario_id,
      finca_id,
      accion,
      entidad,
      entidad_id,
      detalles,
      ip_address,
    });
    return await this.auditoriaRepo.save(log);
  }

  async findAllByFinca(finca_id: number, query: any = {}) {
    const { page = 1, limit = 20, entidad, accion, usuario_id } = query;
    const qb = this.auditoriaRepo.createQueryBuilder('auditoria')
      .leftJoin('auditoria.usuario', 'usuario')
      .addSelect(['usuario.id', 'usuario.nombre', 'usuario.email', 'usuario.rol'])
      .where('auditoria.finca_id = :finca_id', { finca_id })
      .orderBy('auditoria.fecha', 'DESC');

    if (entidad) {
      qb.andWhere('auditoria.entidad = :entidad', { entidad });
    }
    if (accion) {
      qb.andWhere('auditoria.accion = :accion', { accion });
    }
    if (usuario_id) {
      qb.andWhere('auditoria.usuario_id = :usuario_id', { usuario_id });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }
}
