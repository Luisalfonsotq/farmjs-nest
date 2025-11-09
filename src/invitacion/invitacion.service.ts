// src/invitacion/invitacion.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Invitacion, EstadoInvitacion } from './entities/invitacion.entity';
import { CreateInvitacionDto } from './dto/create-invitacion.dto';
import { Usuario, RolUsuario } from '../usuario/entities/usuario.entity';
import { UsuarioFinca } from '../finca/entities/usuario-finca.entity';
import * as crypto from 'crypto';

@Injectable()
export class InvitacionService {
  constructor(
    @InjectRepository(Invitacion)
    private invitacionRepository: Repository<Invitacion>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioFinca)
    private usuarioFincaRepository: Repository<UsuarioFinca>,
  ) {}

  async create(fincaId: number, createInvitacionDto: CreateInvitacionDto): Promise<Invitacion> {
    // Verificar si ya existe invitación pendiente para este email en esta finca
    const invitacionExistente = await this.invitacionRepository.findOne({
      where: {
        email: createInvitacionDto.email,
        finca_id: fincaId,
        estado: EstadoInvitacion.PENDIENTE
      }
    });

    if (invitacionExistente) {
      throw new ConflictException('Ya existe una invitación pendiente para este email en esta finca');
    }

    // Verificar si el usuario ya está en la finca
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { email: createInvitacionDto.email }
    });

    if (usuarioExistente) {
      const vinculoExistente = await this.usuarioFincaRepository.findOne({
        where: {
          usuarioId: usuarioExistente.id,
          fincaId: fincaId
        }
      });

      if (vinculoExistente) {
        throw new ConflictException('Este usuario ya está vinculado a la finca');
      }
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');

    // Crear invitación con expiración de 7 días
    const expiraEn = new Date();
    expiraEn.setDate(expiraEn.getDate() + 7);

    const invitacion = this.invitacionRepository.create({
      ...createInvitacionDto,
      finca_id: fincaId,
      token,
      expira_en: expiraEn,
      estado: EstadoInvitacion.PENDIENTE
    });

    return await this.invitacionRepository.save(invitacion);
  }

  async findByFinca(fincaId: number): Promise<Invitacion[]> {
    return await this.invitacionRepository.find({
      where: { finca_id: fincaId },
      order: { created_at: 'DESC' }
    });
  }

  async findByToken(token: string): Promise<Invitacion> {
    const invitacion = await this.invitacionRepository.findOne({
      where: { token },
      relations: ['finca']
    });

    if (!invitacion) {
      throw new NotFoundException('Invitación no encontrada');
    }

    // Verificar si expiró
    if (new Date() > invitacion.expira_en) {
      invitacion.estado = EstadoInvitacion.EXPIRADA;
      await this.invitacionRepository.save(invitacion);
      throw new BadRequestException('Esta invitación ha expirado');
    }

    if (invitacion.estado !== EstadoInvitacion.PENDIENTE) {
      throw new BadRequestException('Esta invitación ya fue procesada');
    }

    return invitacion;
  }

  async aceptar(token: string, usuarioId: number): Promise<{ mensaje: string, finca: any }> {
    const invitacion = await this.findByToken(token);

    // Verificar que el email del usuario coincida con la invitación
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.email !== invitacion.email) {
      throw new BadRequestException('Esta invitación no es para tu cuenta');
    }

    // Verificar si ya está vinculado
    const vinculoExistente = await this.usuarioFincaRepository.findOne({
      where: {
        usuarioId: usuarioId,
        fincaId: invitacion.finca_id
      }
    });

    if (vinculoExistente) {
      throw new ConflictException('Ya estás vinculado a esta finca');
    }

    // Actualizar rol del usuario si está en PENDING
    if (usuario.rol === RolUsuario.PENDING) {
      usuario.rol = invitacion.rol;
      await this.usuarioRepository.save(usuario);
    }

    // Crear vínculo usuario-finca
    const usuarioFinca = this.usuarioFincaRepository.create({
      usuarioId: usuarioId,
      fincaId: invitacion.finca_id
    });

    await this.usuarioFincaRepository.save(usuarioFinca);

    // Marcar invitación como aceptada
    invitacion.estado = EstadoInvitacion.ACEPTADA;
    await this.invitacionRepository.save(invitacion);

    return {
      mensaje: 'Invitación aceptada exitosamente',
      finca: invitacion.finca
    };
  }

  async rechazar(token: string): Promise<{ mensaje: string }> {
    const invitacion = await this.findByToken(token);

    invitacion.estado = EstadoInvitacion.RECHAZADA;
    await this.invitacionRepository.save(invitacion);

    return { mensaje: 'Invitación rechazada' };
  }

  async cancelar(id: number, fincaId: number): Promise<void> {
    const invitacion = await this.invitacionRepository.findOne({
      where: { id, finca_id: fincaId }
    });

    if (!invitacion) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitacion.estado !== EstadoInvitacion.PENDIENTE) {
      throw new BadRequestException('Solo se pueden cancelar invitaciones pendientes');
    }

    await this.invitacionRepository.remove(invitacion);
  }

  // Tarea cron para limpiar invitaciones expiradas (opcional)
  async limpiarExpiradas(): Promise<void> {
    await this.invitacionRepository.update(
      {
        estado: EstadoInvitacion.PENDIENTE,
        expira_en: LessThan(new Date())
      },
      { estado: EstadoInvitacion.EXPIRADA }
    );
  }
}