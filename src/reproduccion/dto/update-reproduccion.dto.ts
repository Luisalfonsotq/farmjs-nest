// src/reproduccion/dto/update-reproduccion.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateReproduccionDto } from './create-reproduccion.dto';
import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean, IsDateString } from 'class-validator'; // Asegúrate de importar todos los validadores necesarios
import { TipoMonta } from '../entities/reproduccion.entity';

export class UpdateReproduccionDto extends PartialType(CreateReproduccionDto) {
  // Las propiedades son opcionales por PartialType, pero se pueden añadir validadores específicos.
  @IsOptional()
  @IsNumber()
  madre_id?: number; // 🐮 ⬅️ CAMBIO: de animal_id a madre_id

  @IsOptional()
  @IsNumber()
  padre_id?: number | null; // 🐮 ⬅️ CAMBIO: de toro_id a padre_id

  @IsOptional()
  @IsDateString()
  fecha_monta_ia?: Date;

  @IsOptional()
  @IsEnum(TipoMonta)
  tipo_monta?: TipoMonta | null;

  @IsOptional()
  @IsDateString()
  fecha_diagnostico_gestacion?: Date;

  @IsOptional()
  @IsBoolean()
  resultado_gestacion?: boolean;

  @IsOptional()
  @IsDateString()
  fecha_parto?: Date;

  @IsOptional()
  @IsString()
  observaciones?: string;
}