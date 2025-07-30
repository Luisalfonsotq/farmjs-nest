// src/usuario/dto/update-usuario.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MinLength, IsEnum, IsEmail } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';
import { RolUsuario } from '../entities/usuario.entity'; // ¡Importa el enum RolUsuario!

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  // Las propiedades aquí son opcionales porque PartialType ya las hace opcionales.
  // Sin embargo, podemos añadir validadores específicos o anular los existentes.

  @IsOptional()
  @IsString()
  nombre?: string; // Sigue siendo opcional

  @IsOptional()
  @IsEmail()
  email?: string; // Sigue siendo opcional

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }) // Mantenemos la validación de longitud
  password?: string; // Opcional para la actualización, pero se validará si se envía

  @IsOptional()
  @IsEnum(RolUsuario, { message: 'Rol de usuario inválido.' }) // Asegura que el rol enviado sea uno de los valores del enum
  rol?: RolUsuario; // Ahora es de tipo RolUsuario y opcional
}