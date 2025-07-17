// src/finca/dto/create-finca.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDecimal, Min, MaxLength } from 'class-validator';
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

  @IsNumber()
  @IsNotEmpty()
  propietario_id: number;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  @Type(() => Number) // Asegura que se transforme a número si viene como string
  @Min(0)
  tamano_ha?: number;
}