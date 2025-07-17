// src/cria/dto/create-cria.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCriaDto {
  @IsNotEmpty()
  @IsNumber()
  animal_id: number; // ID del Animal que es la cría

  @IsNotEmpty()
  @IsNumber()
  madre_id: number;

  @IsOptional()
  @IsNumber()
  padre_id?: number;

  @IsNotEmpty()
  @IsDateString()
  fecha_nacimiento: Date;
}