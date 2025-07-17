// src/proveedor/dto/create-proveedor.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProveedorDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}