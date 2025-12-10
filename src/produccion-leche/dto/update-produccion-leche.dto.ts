import { PartialType } from '@nestjs/mapped-types';
import { CreateProduccionLecheDto } from './create-produccion-leche.dto';

export class UpdateProduccionLecheDto extends PartialType(CreateProduccionLecheDto) { }
