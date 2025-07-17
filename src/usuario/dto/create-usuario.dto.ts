// src/usuario/dto/create-usuario.dto.ts
import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength, IsIn, IsOptional } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6) // Mínimo de 6 caracteres para la contraseña
  @MaxLength(255)
  password: string;

  @IsString()
  @IsOptional()
  @IsIn(['administrador', 'veterinario', 'colaborador', 'supervisor'])
  rol?: string; // Por defecto será 'colaborador' en la entidad
}