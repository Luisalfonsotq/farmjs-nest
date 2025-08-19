// Ejemplo para create-usuario.dto.ts
import { IsString, IsNotEmpty, IsEmail, IsOptional, MinLength, IsEnum } from 'class-validator';
import { RolUsuario } from '../entities/usuario.entity'; 

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6) 
  password: string;

  @IsOptional()
  @IsEnum(RolUsuario) 
  rol?: RolUsuario;
}