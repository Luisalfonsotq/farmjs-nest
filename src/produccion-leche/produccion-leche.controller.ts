import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ProduccionLecheService } from './produccion-leche.service';
import { CreateProduccionLecheDto } from './dto/create-produccion-leche.dto';
import { UpdateProduccionLecheDto } from './dto/update-produccion-leche.dto';

@Controller('produccion-leche')
export class ProduccionLecheController {
    constructor(private readonly produccionLecheService: ProduccionLecheService) { }

    @Post()
    create(@Body() createProduccionLecheDto: CreateProduccionLecheDto) {
        return this.produccionLecheService.create(createProduccionLecheDto);
    }

    @Get()
    findAll(
        @Query('finca_id') fincaId?: string,
        @Query('animal_id') animalId?: string,
        @Query('fecha_inicio') fechaInicio?: string,
        @Query('fecha_fin') fechaFin?: string,
    ) {
        return this.produccionLecheService.findAll(
            fincaId ? +fincaId : undefined,
            animalId ? +animalId : undefined,
            fechaInicio,
            fechaFin
        );
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.produccionLecheService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProduccionLecheDto: UpdateProduccionLecheDto) {
        return this.produccionLecheService.update(id, updateProduccionLecheDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.produccionLecheService.remove(id);
    }

    // Rutas adicionales de reportes si se necesita
    @Get('resumen/diario')
    getDailyTotal(
        @Query('finca_id', ParseIntPipe) fincaId: number,
        @Query('fecha') fecha: string
    ) {
        return this.produccionLecheService.getDailyProduction(fincaId, fecha);
    }
}
