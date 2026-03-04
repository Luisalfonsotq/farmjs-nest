// src/tarea/dto/update-tarea.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateTareaDto } from './create-tarea.dto';
import { EstadoTarea } from '../entities/tarea.entity';

export class UpdateTareaDto extends PartialType(CreateTareaDto) { }

export class CompletarTareaDto {
    @IsOptional()
    @IsString()
    notas_supervisor?: string;
}

export class ReportarProblemaTareaDto {
    @IsOptional()
    @IsString()
    reporte_foto_url?: string;

    @IsOptional()
    @IsString()
    reporte_descripcion?: string;
}

export class CambiarEstadoTareaDto {
    @IsEnum(EstadoTarea)
    estado: EstadoTarea;

    @IsOptional()
    @IsString()
    notas_supervisor?: string;
}
