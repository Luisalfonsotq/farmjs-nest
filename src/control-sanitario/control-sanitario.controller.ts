// src/control-sanitario/control-sanitario.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ControlSanitarioService } from './control-sanitario.service';
import { CreateControlSanitarioDto } from './dto/create-control-sanitario.dto';
import { UpdateControlSanitarioDto } from './dto/update-control-sanitario.dto';
// Importa guards si los usas
// import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } from '../auth/enums/role.enum';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('controles-sanitarios')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class ControlSanitarioController {
  constructor(private readonly control_sanitario_service: ControlSanitarioService) {}

  @Post()
  // @Roles(Role.VETERINARIO)
  async crear(@Body() create_dto: CreateControlSanitarioDto) {
    return this.control_sanitario_service.crear(create_dto);
  }

  @Get()
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_todos() {
    return this.control_sanitario_service.obtener_todos();
  }

  @Get(':id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_por_id(@Param('id') id: string) {
    return this.control_sanitario_service.obtener_por_id(+id);
  }

  @Patch(':id')
  // @Roles(Role.VETERINARIO)
  async actualizar(@Param('id') id: string, @Body() update_dto: UpdateControlSanitarioDto) {
    return this.control_sanitario_service.actualizar(+id, update_dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(Role.VETERINARIO)
  async eliminar(@Param('id') id: string) {
    await this.control_sanitario_service.eliminar(+id);
  }

  @Get('por-animal/:animal_id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_controles_por_animal(@Param('animal_id') animal_id: string) {
    return this.control_sanitario_service.obtener_controles_por_animal(+animal_id);
  }
}