// src/usuario/dto/create-usuario.dto.ts
import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

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
}