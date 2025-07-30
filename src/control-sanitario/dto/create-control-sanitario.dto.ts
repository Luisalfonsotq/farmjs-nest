// src/control-sanitario/dto/create-control-sanitario.dto.ts
import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';
import { TipoTratamiento, TipoEnfermedad } from '../entities/control-sanitario.entity';

export class CreateControlSanitarioDto {
  @IsNotEmpty()
  @IsNumber()
  animal_id: number;

  @IsNotEmpty()
  @IsNumber()
  tipo_control_id: number;

  // 🐮 ¡AÑADE EL ID DEL VETERINARIO (USUARIO)!
  @IsOptional() // Podría ser opcional si el usuario que registra el control es el veterinario loggeado
  @IsNumber()
  veterinario_id?: number | null; // El ID del usuario que actúa como veterinario

  @IsNotEmpty()
  @IsDateString()
  fecha_control: Date;

  @IsOptional()
  @IsEnum(TipoTratamiento)
  tipo_tratamiento?: TipoTratamiento | null;

  @IsOptional()
  @IsEnum(TipoEnfermedad)
  tipo_enfermedad?: TipoEnfermedad | null;

  @IsOptional()
  @IsString()
  medicamento_dosis?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}