// src/reproduccion/dto/create-reproduccion.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';

enum TipoMonta {
  NATURAL = 'Natural',
  INSEMINACION = 'Inseminacion',
}

export class CreateReproduccionDto {
  @IsNotEmpty()
  @IsNumber()
  animal_id: number; // ID de la madre

  @IsOptional()
  @IsDateString()
  fecha_celo?: Date;

  @IsOptional()
  @IsDateString()
  fecha_monta?: Date;

  @IsOptional()
  @IsEnum(TipoMonta)
  tipo_monta?: TipoMonta;

  @IsOptional()
  @IsNumber()
  toro_id?: number; // ID del padre

  @IsOptional()
  @IsDateString()
  fecha_confirmacion_prenez?: Date;

  @IsOptional()
  @IsDateString()
  fecha_parto?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  crias_nacidas?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}