// src/reproduccion/reproduccion.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ReproduccionService } from './reproduccion.service';
import { CreateReproduccionDto } from './dto/create-reproduccion.dto';
import { UpdateReproduccionDto } from './dto/update-reproduccion.dto';
// Importa guards si los usas
// import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } from '../auth/enums/role.enum';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('reproducciones')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReproduccionController {
  constructor(private readonly reproduccion_service: ReproduccionService) {}

  @Post()
  // @Roles(Role.VETERINARIO, Role.SUPERVISOR)
  async crear(@Body() create_dto: CreateReproduccionDto) {
    return this.reproduccion_service.crear(create_dto);
  }

  @Get()
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_todos() {
    return this.reproduccion_service.obtener_todos();
  }

  @Get(':id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_por_id(@Param('id') id: string) {
    return this.reproduccion_service.obtener_por_id(+id);
  }

  @Patch(':id')
  // @Roles(Role.VETERINARIO, Role.SUPERVISOR)
  async actualizar(@Param('id') id: string, @Body() update_dto: UpdateReproduccionDto) {
    return this.reproduccion_service.actualizar(+id, update_dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(Role.VETERINARIO, Role.SUPERVISOR)
  async eliminar(@Param('id') id: string) {
    await this.reproduccion_service.eliminar(+id);
  }

  @Get('por-madre/:madre_id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_reproducciones_por_madre(@Param('madre_id') madre_id: string) {
    return this.reproduccion_service.obtener_reproducciones_por_madre(+madre_id);
  }
}