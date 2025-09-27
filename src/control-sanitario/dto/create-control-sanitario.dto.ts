// src/control-sanitario/dto/create-control-sanitario.dto.ts
import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, IsDecimal } from 'class-validator';

export class CreateControlSanitarioDto {
  @IsNotEmpty()
  @IsNumber()
  animal_id: number;

  @IsNotEmpty()
  @IsNumber()
  tipo_control_id: number;

  @IsOptional()
  @IsNumber()
  veterinario_id?: number | null;

  @IsNotEmpty()
  @IsDateString()
  fecha: Date;

  @IsOptional()
  @IsString()
  medicamento?: string;

  @IsOptional()
  @IsDecimal()
  dosis?: number;

  @IsOptional()
  @IsString()
  via_aplicacion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsDecimal()
  costo?: number;
}