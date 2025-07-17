// src/potrero/dto/create-potrero.dto.ts
import { IsString, IsNumber, IsNotEmpty, Min, IsOptional, IsDateString } from 'class-validator';

export class CreatePotreroDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  tamano_ha: number;

  @IsOptional()
  @IsString()
  tipo_pasto?: string;

  @IsNotEmpty()
  @IsNumber()
  finca_id: number; // ID de la finca a la que pertenece

  @IsOptional()
  @IsDateString()
  ocupado_desde?: Date;

  @IsOptional()
  @IsDateString()
  ocupado_hasta?: Date;
}