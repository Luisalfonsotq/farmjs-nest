// src/evento-animal/dto/create-evento-animal.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEventoAnimalDto {
  @IsNotEmpty()
  @IsNumber()
  animal_id: number;

  @IsNotEmpty()
  @IsNumber()
  tipo_evento_id: number;

  @IsNotEmpty()
  @IsDateString()
  fecha: Date;

  @IsOptional()
  @IsString()
  detalle?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor_medida?: number;

  @IsOptional()
  @IsNumber()
  potrero_anterior_id?: number;

  @IsOptional()
  @IsNumber()
  potrero_actual_id?: number;
}