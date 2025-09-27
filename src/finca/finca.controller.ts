// src/finca/finca.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { FincaService } from './finca.service';
import { CreateFincaDto } from './dto/create-finca.dto';
import { UpdateFincaDto } from './dto/update-finca.dto';
import { AssignFincaDto } from './dto/assign-finca.dto';

@Controller('fincas') // Prefijo de ruta para este controlador
export class FincaController {
  constructor(private readonly fincaService: FincaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
 async create(@Body() createFincaDto: CreateFincaDto) {
    return this.fincaService.create(createFincaDto);
  }

  @Get()
  async findAll(@Query('propietario_id') propietarioId?: string) {
    if (propietarioId) {
      return this.fincaService.findByPropietario(+propietarioId);
    }
    return this.fincaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.fincaService.findOne(+id); // El + convierte el string a number
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFincaDto: UpdateFincaDto) {
    return this.fincaService.update(+id, updateFincaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content para eliminación exitosa
  async remove(@Param('id') id: string) {
    return this.fincaService.remove(+id);
  }

  // Rutas para gestionar la asignación de fincas a usuarios (ej. administradores)
  @Post('assign')
  // @Roles(Role.ADMINISTRADOR)
  async assignFincaToUser(@Body() assignFincaDto: AssignFincaDto) {
    return this.fincaService.assignFincaToUser(assignFincaDto);
  }

  @Delete('unassign/:usuarioId/:fincaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(Role.ADMINISTRADOR)
  async removeFincaFromUser(@Param('usuarioId') usuarioId: string, @Param('fincaId') fincaId: string) {
    await this.fincaService.removeFincaFromUser(+usuarioId, +fincaId);
  }

  @Get('by-user/:userId')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR) // O cualquier rol que necesite ver sus fincas
  async getFincasManagedByUser(@Param('userId') userId: string) {
    return this.fincaService.getFincasManagedByUser(+userId);
  }
}