// src/potrero/dto/rotacion-potrero.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RotacionPotreroDto {
    /**
     * ID del potrero ORIGEN (del que se moverá el ganado)
     */
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    potrero_origen_id: number;

    /**
     * ID del potrero DESTINO (al que se moverá el ganado)
     */
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    potrero_destino_id: number;

    /**
     * Motivo de la rotación (ej: "Pasto agotado", "Descanso programado")
     */
    @IsOptional()
    @IsString()
    motivo?: string;
}
