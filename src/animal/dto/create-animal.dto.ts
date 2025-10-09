// src/animal/dto/create-animal.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { SexoAnimal, EstadoSalud, EstadoReproductivo, OrigenAnimal } from '../entities/animal.entity';

export class CreateAnimalDto {
  @IsNotEmpty()
  @IsString()
  identificador_unico: string;

  @IsOptional()
  @IsString()
  raza?: string;

  @IsNotEmpty()
  @IsEnum(SexoAnimal)
  sexo: SexoAnimal;

  @IsOptional()
  @IsNumber()
  @Min(0)
  peso_kg: number;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: Date;

  @IsOptional()
  @IsEnum(EstadoReproductivo)
  estado_reproductivo?: EstadoReproductivo;

  @IsOptional()
  @IsEnum(EstadoSalud)
  estado_salud?: EstadoSalud;

  @IsOptional()
  @IsEnum(OrigenAnimal)
  origen?: OrigenAnimal;

  @IsOptional()
  @IsDateString()
  fecha_adquisicion?: Date;

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