// src/potrero/dto/update-potrero.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePotreroDto } from './create-potrero.dto';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty, Min, Max, IsOptional, IsDateString } from 'class-validator';

export class UpdatePotreroDto extends PartialType(CreatePotreroDto) {
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