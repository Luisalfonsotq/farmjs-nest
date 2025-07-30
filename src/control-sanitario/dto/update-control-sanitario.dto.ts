// src/control-sanitario/dto/update-control-sanitario.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateControlSanitarioDto } from './create-control-sanitario.dto';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { TipoTratamiento, TipoEnfermedad } from '../entities/control-sanitario.entity';

export class UpdateControlSanitarioDto extends PartialType(CreateControlSanitarioDto) {
  @IsOptional()
  @IsNumber()
  tipo_control_id?: number;

  // 🐮 ¡AÑADE EL ID DEL VETERINARIO (USUARIO)!
  @IsOptional()
  @IsNumber()
  veterinario_id?: number | null;

  @IsOptional()
  @IsEnum(TipoTratamiento)
  tipo_tratamiento?: TipoTratamiento | null;

  @IsOptional()
  @IsEnum(TipoEnfermedad)
  tipo_enfermedad?: TipoEnfermedad | null;

  @IsOptional()
  @IsString()
  medicamento_dosis?: string;
}