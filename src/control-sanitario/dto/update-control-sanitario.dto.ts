// src/control-sanitario/dto/update-control-sanitario.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateControlSanitarioDto } from './create-control-sanitario.dto';

export class UpdateControlSanitarioDto extends PartialType(CreateControlSanitarioDto) { }