import { PartialType } from '@nestjs/mapped-types'; // Para aprovechar clases existentes en CreateUserDto
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

// Hereda los campos de CreateUserDto como opcionales
export class UpdateUserDto extends PartialType(CreateUsuarioDto) {
    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string; // En caso de que desee actualizar la contraseña
}