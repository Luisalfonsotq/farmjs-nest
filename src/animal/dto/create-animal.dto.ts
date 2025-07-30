// src/animal/dto/create-animal.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { SexoAnimal, EstadoAnimal } from '../entities/animal.entity'; 

export class CreateAnimalDto {
  @IsNotEmpty()
  @IsString()
  numero_identificador: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsNotEmpty()
  @IsEnum(SexoAnimal)
  sexo: SexoAnimal;

  @IsOptional()
  @IsString()
  raza?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  peso_nacimiento?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  peso_actual?: number;

  @IsOptional()
  @IsDateString()
  fecha_adquisicion?: Date;

  @IsOptional()
  @IsEnum(EstadoAnimal)
  estado?: EstadoAnimal; // Tipo sigue siendo EstadoAnimal

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsNotEmpty()
  @IsNumber()
  finca_id: number;

  @IsOptional()
  @IsNumber()
  potrero_id?: number;

  @IsOptional()
  @IsNumber()
  proveedor_id?: number | null;
}