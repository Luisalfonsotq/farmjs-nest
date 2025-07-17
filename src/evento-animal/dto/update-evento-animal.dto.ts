// src/evento-animal/dto/update-evento-animal.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventoAnimalDto } from './create-evento-animal.dto';

export class UpdateEventoAnimalDto extends PartialType(CreateEventoAnimalDto) {}