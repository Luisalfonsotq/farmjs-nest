// src/finca/dto/assign-finca.dto.ts (para asignar fincas a usuarios gestores)
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignFincaDto {
  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @IsNotEmpty()
  @IsNumber()
  fincaId: number;
}