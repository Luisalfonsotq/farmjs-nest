// src/control-sanitario/dto/create-control-sanitario.dto.ts
import {
  IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString
} from 'class-validator';

export class CreateControlSanitarioDto {
  @IsNotEmpty()
  @IsNumber()
  animal_id: number;

  /**
   * Nombre del control sanitario, proveniente de controlesSanitariosBase (frontend).
   * Ej: "Vacunación Fiebre Aftosa (FMD)", "Control de Garrapatas (Rhipicephalus)"
   */
  @IsNotEmpty()
  @IsString()
  nombre_control: string;

  /**
   * Categoría del control (Vacunación, Control de parásitos, Reproductivo, etc.)
   * Proviene de controlesSanitariosBase.categoria en el frontend.
   */
  @IsOptional()
  @IsString()
  categoria_control?: string | null;

  @IsOptional()
  @IsNumber()
  veterinario_id?: number | null;

  @IsNotEmpty()
  @IsDateString()
  fecha: Date;

  @IsOptional()
  @IsString()
  medicamento?: string | null;

  @IsOptional()
  @IsNumber()
  dosis?: number | null;

  @IsOptional()
  @IsString()
  via_aplicacion?: string | null;

  @IsOptional()
  @IsString()
  observaciones?: string | null;

  @IsOptional()
  @IsNumber()
  costo?: number | null;
}