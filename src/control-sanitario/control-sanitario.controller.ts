// src/control-sanitario/control-sanitario.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ControlSanitarioService } from './control-sanitario.service';
import { CreateControlSanitarioDto } from './dto/create-control-sanitario.dto';
import { UpdateControlSanitarioDto } from './dto/update-control-sanitario.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '../usuario/entities/usuario.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('controles-sanitarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ControlSanitarioController {
  constructor(private readonly control_sanitario_service: ControlSanitarioService) {}

  @Post()
  @Roles(RolUsuario.VETERINARIO)
  async crear(@Body() create_dto: CreateControlSanitarioDto) {
    return this.control_sanitario_service.crear(create_dto);
  }

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR, RolUsuario.VETERINARIO, RolUsuario.COLABORADOR)
  async obtener_todos() {
    return this.control_sanitario_service.obtener_todos();
  }

  @Get(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR, RolUsuario.VETERINARIO, RolUsuario.COLABORADOR)
  async obtener_por_id(@Param('id') id: string) {
    return this.control_sanitario_service.obtener_por_id(+id);
  }

  @Patch(':id')
  @Roles(RolUsuario.VETERINARIO)
  async actualizar(@Param('id') id: string, @Body() update_dto: UpdateControlSanitarioDto) {
    return this.control_sanitario_service.actualizar(+id, update_dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RolUsuario.VETERINARIO)
  async eliminar(@Param('id') id: string) {
    await this.control_sanitario_service.eliminar(+id);
  }

  @Get('por-animal/:animal_id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR, RolUsuario.VETERINARIO, RolUsuario.COLABORADOR)
  async obtener_controles_por_animal(@Param('animal_id') animal_id: string) {
    return this.control_sanitario_service.obtener_controles_por_animal(+animal_id);
  }
}