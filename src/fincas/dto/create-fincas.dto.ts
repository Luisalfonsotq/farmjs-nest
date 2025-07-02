import { IsString, IsOptional, IsNumber, IsPositive, IsInt } from 'class-validator';

export class CreateFincaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsInt()
  propietario_id?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  tamano_ha?: number;
}
