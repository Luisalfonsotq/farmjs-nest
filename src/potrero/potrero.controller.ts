// src/potrero/potrero.controller.ts
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
  UseGuards,
} from '@nestjs/common';
import { PotreroService } from './potrero.service';
import { CreatePotreroDto } from './dto/create-potrero.dto';
import { UpdatePotreroDto } from './dto/update-potrero.dto';
import { RotacionPotreroDto } from './dto/rotacion-potrero.dto';
import { EstadoPasto } from './entities/potrero.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FincaAccessGuard } from '../auth/guards/finca-access.guard';

@Controller('potreros')
@UseGuards(JwtAuthGuard, FincaAccessGuard)
export class PotreroController {
  constructor(private readonly potreroService: PotreroService) { }

  // ──────────────── CRUD BÁSICO ────────────────

  @Post()
  async create(@Body() createPotreroDto: CreatePotreroDto) {
    return this.potreroService.create(createPotreroDto);
  }

  @Get()
  async findAll() {
    return this.potreroService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.potreroService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePotreroDto: UpdatePotreroDto) {
    return this.potreroService.update(+id, updatePotreroDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.potreroService.remove(+id);
  }

  @Get('by-finca/:fincaId')
  async findPotrerosByFinca(@Param('fincaId') fincaId: string) {
    return this.potreroService.findPotrerosByFinca(+fincaId);
  }

  // ──────────────── ROTACIÓN ────────────────

  /**
   * GET /potreros/by-finca/:fincaId/detalle
   * Retorna los potreros con info de animales, estado del pasto
   * y disponibilidad, para la pantalla de rotación.
   */
  @Get('by-finca/:fincaId/detalle')
  async getPotrerosByFincaConDetalle(@Param('fincaId') fincaId: string) {
    return this.potreroService.findPotrerosByFincaConDetalle(+fincaId);
  }

  /**
   * POST /potreros/rotacion
   * Ejecuta la rotación de todos los animales de un potrero a otro.
   */
  @Post('rotacion')
  @HttpCode(HttpStatus.OK)
  async ejecutarRotacion(@Body() dto: RotacionPotreroDto) {
    return this.potreroService.ejecutarRotacion(dto);
  }

  /**
   * PATCH /potreros/:id/estado-pasto
   * Permite al colaborador/supervisor actualizar el estado del pasto.
   */
  @Patch(':id/estado-pasto')
  async actualizarEstadoPasto(
    @Param('id') id: string,
    @Body('estado_pasto') estado_pasto: EstadoPasto,
  ) {
    return this.potreroService.actualizarEstadoPasto(+id, estado_pasto);
  }
}