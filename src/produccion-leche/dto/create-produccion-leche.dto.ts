import { IsNotEmpty, IsDateString, IsNumber, IsEnum, IsOptional, IsString, IsPositive } from 'class-validator';
import { JornadaOrdeño } from '../entities/produccion-leche.entity';

export class CreateProduccionLecheDto {
    @IsDateString()
    @IsNotEmpty()
    fecha: string;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    cantidad: number;

    @IsEnum(JornadaOrdeño)
    @IsOptional()
    jornada?: JornadaOrdeño;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsNumber()
    @IsNotEmpty()
    animal_id: number;

    // finca_id is usually taken from context or animal, but let's allow it to be passed
    // or validated that the animal belongs to the user's managed finca. 
    // For simplicity, we pass it or infer it. Let's require it to be explicit or handle in service.
    // Best practice: Validate animal belongs to a finca user has access to.
    // We'll trust the frontend sends it, and backend validates generic permissions.
    @IsNumber()
    @IsNotEmpty()
    finca_id: number;
}
