// src/finca/dto/update-finca.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateFincaDto } from './create-finca.dto';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDecimal, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';


export class UpdateFincaDto extends PartialType(CreateFincaDto) {
    @IsOptional()
    @IsNumber()
    @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
    @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
    @Type(() => Number)
    latitud?: number;

    @IsOptional()
    @IsNumber()
    @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
    @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
    @Type(() => Number)
    longitud?: number;
}