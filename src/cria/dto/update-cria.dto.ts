// src/cria/dto/update-cria.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCriaDto } from './create-cria.dto';

export class UpdateCriaDto extends PartialType(CreateCriaDto) {}