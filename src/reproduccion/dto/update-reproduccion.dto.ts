// src/reproduccion/dto/update-reproduccion.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateReproduccionDto } from './create-reproduccion.dto';

export class UpdateReproduccionDto extends PartialType(CreateReproduccionDto) {}