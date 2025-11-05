// src/potrero/dto/create-potrero.dto.ts
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty, Min, Max, IsOptional, IsDateString } from 'class-validator';

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

  @IsOptional()
  @IsNumber()
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  @Type(() => Number)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  @Type(() => Number)
  longitud?: number;

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