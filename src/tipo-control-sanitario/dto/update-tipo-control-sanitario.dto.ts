// src/tipo-control-sanitario/dto/update-tipo-control-sanitario.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoControlSanitarioDto } from './create-tipo-control-sanitario.dto';

export class UpdateTipoControlSanitarioDto extends PartialType(CreateTipoControlSanitarioDto) {}