// src/tarea/dto/create-tarea.dto.ts
import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
    IsDateString,
    MaxLength,
} from 'class-validator';
import { CategoriaTarea, EstadoTarea, PrioridadTarea } from '../entities/tarea.entity';

export class CreateTareaDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    titulo: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsEnum(PrioridadTarea)
    prioridad?: PrioridadTarea;

    @IsOptional()
    @IsEnum(CategoriaTarea)
    categoria?: CategoriaTarea;

    @IsOptional()
    @IsEnum(EstadoTarea)
    estado?: EstadoTarea;

    @IsOptional()
    @IsDateString()
    fecha_limite?: string;

    @IsNotEmpty()
    @IsNumber()
    creado_por_id: number;

    @IsOptional()
    @IsNumber()
    asignado_a_id?: number;

    @IsNotEmpty()
    @IsNumber()
    finca_id: number;

    @IsOptional()
    @IsNumber()
    potrero_id?: number;
}
