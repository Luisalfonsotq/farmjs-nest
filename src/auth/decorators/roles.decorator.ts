// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../usuario/entities/usuario.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
