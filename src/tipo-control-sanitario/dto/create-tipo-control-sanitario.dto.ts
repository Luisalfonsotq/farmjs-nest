// src/tipo-control-sanitario/dto/create-tipo-control-sanitario.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTipoControlSanitarioDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  aplica_a_sexo?: boolean;

  @IsOptional()
  @IsBoolean()
  requiere_medicamento?: boolean;
}