// src/control-sanitario/dto/create-control-sanitario.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateControlSanitarioDto {
  @IsNotEmpty()
  @IsNumber()
  animal_id: number;

  @IsNotEmpty()
  @IsNumber()
  tipo_control_id: number;

  @IsNotEmpty()
  @IsNumber()
  veterinario_id: number;

  @IsNotEmpty()
  @IsDateString()
  fecha: Date;

  @IsOptional()
  @IsString()
  medicamento?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dosis?: number;

  @IsOptional()
  @IsString()
  via_aplicacion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costo?: number;
}