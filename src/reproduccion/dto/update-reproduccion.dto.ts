// src/reproduccion/dto/update-reproduccion.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateReproduccionDto } from './create-reproduccion.dto';
import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { TipoMonta } from '../entities/reproduccion.entity';

export class UpdateReproduccionDto extends PartialType(CreateReproduccionDto) {
  @IsOptional()
  @IsNumber()
  animal_id?: number;

  @IsOptional()
  @IsNumber()
  toro_id?: number | null;
}