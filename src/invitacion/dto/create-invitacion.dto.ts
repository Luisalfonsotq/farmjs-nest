// src/invitacion/dto/create-invitacion.dto.ts
import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { RolUsuario } from '../../usuario/entities/usuario.entity';

export class CreateInvitacionDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol: RolUsuario;
}