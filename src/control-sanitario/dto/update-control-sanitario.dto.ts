// src/control-sanitario/dto/update-control-sanitario.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateControlSanitarioDto } from './create-control-sanitario.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdateControlSanitarioDto extends PartialType(CreateControlSanitarioDto) {
  @IsOptional()
  @IsNumber()
  animal_id?: number;

  @IsOptional()
  @IsNumber()
  tipo_control_id?: number;

  @IsOptional()
  @IsNumber()
  veterinario_id?: number | null;
}