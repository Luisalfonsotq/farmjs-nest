// Ejemplo para create-usuario.dto.ts
import { IsString, IsNotEmpty, IsEmail, IsOptional, MinLength, IsEnum } from 'class-validator';
import { RolUsuario } from '../entities/usuario.entity'; // Importa el enum

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6) // Asegura una longitud mínima para la contraseña
  password: string;

  @IsOptional()
  @IsEnum(RolUsuario) // Usa el enum para el rol
  rol?: RolUsuario;
}