// src/tipo-evento-animal/dto/create-tipo-evento-animal.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTipoEventoAnimalDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}