// src/animal/dto/update-animal.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimalDto } from './create-animal.dto';

// El PartialType hace que todas las propiedades de CreateAnimalDto sean opcionales.
// Esto es ideal para las operaciones de actualización (PATCH) donde no todos los campos
// serán enviados en la solicitud.
export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {}