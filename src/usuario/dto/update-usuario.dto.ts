// src/usuario/dto/update-usuario.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

// Hereda todos los campos de CreateUsuarioDto como opcionales
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsString()
  @IsOptional()
  @MinLength(6) // Si se actualiza la contraseña, que cumpla el mínimo
  password?: string; // La contraseña también puede ser opcional al actualizar
}