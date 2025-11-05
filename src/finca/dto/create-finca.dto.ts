// src/finca/dto/create-finca.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDecimal, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFincaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  ubicacion?: string;

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

  @IsNumber()
  @IsNotEmpty()
  propietario_id: number;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  @Type(() => Number) // Asegura que se transforme a número si viene como string
  @Min(0)
  tamano_ha?: number;
}