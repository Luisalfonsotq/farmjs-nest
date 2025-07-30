// src/reproduccion/dto/create-reproduccion.dto.ts
import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { TipoMonta } from '../entities/reproduccion.entity'; // Importa TipoMonta

export class CreateReproduccionDto {
  @IsNotEmpty()
  @IsNumber()
  madre_id: number; // 🐮 ⬅️ CAMBIO: de animal_id a madre_id

  @IsOptional()
  @IsNumber()
  padre_id?: number | null; // 🐮 ⬅️ CAMBIO: de toro_id a padre_id

  @IsNotEmpty()
  @IsDateString()
  fecha_monta_ia: Date; // 🐮 ⬅️ Propiedad actualizada

  @IsOptional()
  @IsEnum(TipoMonta)
  tipo_monta?: TipoMonta | null;

  @IsOptional()
  @IsDateString()
  fecha_diagnostico_gestacion?: Date; // 🐮 ⬅️ Propiedad nueva

  @IsOptional()
  @IsBoolean()
  resultado_gestacion?: boolean; // 🐮 ⬅️ Propiedad nueva

  @IsOptional()
  @IsDateString()
  fecha_parto?: Date;

  @IsOptional()
  @IsString()
  observaciones?: string;
}