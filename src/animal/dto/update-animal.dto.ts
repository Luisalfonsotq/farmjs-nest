// src/animal/dto/update-animal.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimalDto } from './create-animal.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoAnimal } from '../entities/animal.entity';

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
  @IsOptional()
  @IsEnum(EstadoAnimal)
  estado?: EstadoAnimal;
}