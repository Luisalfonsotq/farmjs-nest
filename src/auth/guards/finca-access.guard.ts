import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioFinca } from '../../finca/entities/usuario-finca.entity';
import { Usuario, RolUsuario } from '../../usuario/entities/usuario.entity';
import { Finca } from '../../finca/entities/finca.entity';

@Injectable()
export class FincaAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(UsuarioFinca)
    private usuarioFincaRepository: Repository<UsuarioFinca>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: Usuario = request.user;

    if (!user) {
      return false;
    }

    // Si es admin global, tiene acceso a todo
    if (user.rol === RolUsuario.ADMINISTRADOR) {
      return true;
    }

    // Intentar obtener finca_id de params, query o body
    let fincaId = request.params.fincaId || request.params.finca_id ||
      request.query.finca_id || request.query.fincaId ||
      request.body.finca_id || request.body.fincaId;

    // Si no hay finca_id en la petición, este guard no aplica
    if (!fincaId) {
      return true;
    }

    fincaId = Number(fincaId);
    if (isNaN(fincaId)) {
      throw new BadRequestException('Invalid finca ID');
    }

    console.log(`[FincaAccessGuard] User: ${user.id} (${user.rol}), FincaId: ${fincaId}`);

    // Verificar si el usuario tiene acceso a través de UsuarioFinca
    const acceso = await this.usuarioFincaRepository.findOne({
      where: {
        usuarioId: user.id,
        fincaId: fincaId,
      },
    });

    if (acceso) {
      console.log('[FincaAccessGuard] Access granted via UsuarioFinca');
      return true;
    }

    // Si no está en UsuarioFinca, verificar si es el propietario
    const finca = await this.usuarioFincaRepository.manager.getRepository(Finca).findOne({
      where: { id: fincaId },
      relations: ['propietario'],
    });

    if (finca) {
      console.log(`[FincaAccessGuard] Finca owner: ${finca.propietario?.id}`);
    } else {
      console.log(`[FincaAccessGuard] Finca not found: ${fincaId}`);
    }

    if (finca && finca.propietario && finca.propietario.id === user.id) {
      console.log('[FincaAccessGuard] Access granted via Ownership');
      return true;
    }

    console.log('[FincaAccessGuard] Access denied');
    throw new ForbiddenException('No tienes acceso a esta finca');
  }
}
