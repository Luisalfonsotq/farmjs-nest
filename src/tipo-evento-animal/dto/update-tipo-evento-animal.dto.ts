// src/tipo-evento-animal/dto/update-tipo-evento-animal.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoEventoAnimalDto } from './create-tipo-evento-animal.dto';

export class UpdateTipoEventoAnimalDto extends PartialType(CreateTipoEventoAnimalDto) {}