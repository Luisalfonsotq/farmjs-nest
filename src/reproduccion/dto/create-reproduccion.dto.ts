// src/reproduccion/dto/create-reproduccion.dto.ts
import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';
import { TipoMonta } from '../entities/reproduccion.entity';

export class CreateReproduccionDto {
  @IsNotEmpty()
  @IsNumber()
  animal_id: number;

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
  toro_id?: number | null;

  @IsOptional()
  @IsDateString()
  fecha_confirmacion_prenez?: Date;

  @IsOptional()
  @IsDateString()
  fecha_parto?: Date;

  @IsOptional()
  @IsNumber()
  crias_nacidas?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}