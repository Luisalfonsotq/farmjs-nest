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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnimalService } from './animal.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { Animal } from './entities/animal.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FincaAccessGuard } from '../auth/guards/finca-access.guard';

@Controller('animales')
@UseGuards(JwtAuthGuard, FincaAccessGuard)
export class AnimalController {
  constructor(private readonly animalService: AnimalService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAnimalDto: CreateAnimalDto): Promise<Animal> {
    return this.animalService.crear(createAnimalDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Animal[]> {
    return this.animalService.obtener_todos();
  }

  @Get('alertas-sanitarias')
  @HttpCode(HttpStatus.OK)
  async getAlertasSanitarias(@Query('finca_id') fincaId?: string): Promise<Animal[]> {
    return this.animalService.obtener_animales_con_alertas_sanitarias(
      fincaId ? +fincaId : undefined
    );
  }

  @Get('proximos-partos')
  @HttpCode(HttpStatus.OK)
  async getProximosPartos(
    @Query('dias') dias?: string,
    @Query('finca_id') fincaId?: string
  ): Promise<Animal[]> {
    return this.animalService.obtener_animales_proximos_a_parir(
      dias ? +dias : 30,
      fincaId ? +fincaId : undefined
    );
  }

  @Get('estadisticas/etapas-vida')
  @HttpCode(HttpStatus.OK)
  async getEstadisticasEtapasVida(@Query('finca_id') fincaId?: string): Promise<any> {
    return this.animalService.obtener_estadisticas_etapas_vida(
      fincaId ? +fincaId : undefined
    );
  }

  @Get('finca/:fincaId')
  @HttpCode(HttpStatus.OK)
  async findAnimalsByFinca(@Param('fincaId') fincaId: string): Promise<Animal[]> {
    return this.animalService.obtener_animales_por_finca(+fincaId);
  }

  @Get('potrero/:potreroId')
  @HttpCode(HttpStatus.OK)
  async findAnimalsByPotrero(@Param('potreroId') potreroId: string): Promise<Animal[]> {
    return this.animalService.obtener_animales_por_potrero(+potreroId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Animal> {
    return this.animalService.obtener_por_id(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateAnimalDto: UpdateAnimalDto,
  ): Promise<Animal> {
    return this.animalService.actualizar(+id, updateAnimalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.animalService.eliminar(+id);
  }
}