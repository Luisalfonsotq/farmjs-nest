// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolUsuario } from '../../usuario/entities/usuario.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles definidos en la ruta, se permite el acceso
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtener el usuario autenticado de la petición
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false; // Si no hay usuario, el acceso es denegado
    }

    // 3. Verificar si el rol del usuario está incluido en los roles requeridos
    return requiredRoles.some((role) => user.rol === role);
  }
}
