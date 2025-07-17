// src/animal/animal.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnimalService } from './animal.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { Animal } from './entities/animal.entity'; // Import the Animal entity

@Controller('animales') // Define a base route for this controller
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // Return 201 Created on successful creation
  async create(@Body() createAnimalDto: CreateAnimalDto): Promise<Animal> {
    // 🐄 ⬅️ CAMBIO: 'create' a 'crear'
    return this.animalService.crear(createAnimalDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK) // Return 200 OK on successful retrieval
  async findAll(): Promise<Animal[]> {
    // 🐄 ⬅️ CAMBIO: 'findAll' a 'obtener_todos'
    return this.animalService.obtener_todos();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Animal> {
    // 🐄 ⬅️ CAMBIO: 'findOne' a 'obtener_por_id'
    return this.animalService.obtener_por_id(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateAnimalDto: UpdateAnimalDto,
  ): Promise<Animal> {
    // 🐄 ⬅️ CAMBIO: 'update' a 'actualizar'
    return this.animalService.actualizar(+id, updateAnimalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 No Content on successful deletion
  async remove(@Param('id') id: string): Promise<void> {
    // 🐄 ⬅️ CAMBIO: 'remove' a 'eliminar'
    await this.animalService.eliminar(+id);
  }

  @Get('finca/:fincaId')
  @HttpCode(HttpStatus.OK)
  async findAnimalsByFinca(@Param('fincaId') fincaId: string): Promise<Animal[]> {
    // 🐄 ⬅️ CAMBIO: 'findAnimalsByFinca' a 'obtener_animales_por_finca' (o el nombre que le hayas dado)
    // NOTA: Si no tienes este método en tu AnimalService, deberás agregarlo.
    return this.animalService.obtener_animales_por_finca(+fincaId);
  }

  @Get('potrero/:potreroId')
  @HttpCode(HttpStatus.OK)
  async findAnimalsByPotrero(@Param('potreroId') potreroId: string): Promise<Animal[]> {
    // 🐄 ⬅️ CAMBIO: 'findAnimalsByPotrero' a 'obtener_animales_por_potrero' (o el nombre que le hayas dado)
    // NOTA: Si no tienes este método en tu AnimalService, deberás agregarlo.
    return this.animalService.obtener_animales_por_potrero(+potreroId);
  }
}