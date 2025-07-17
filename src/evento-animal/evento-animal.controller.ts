// src/evento-animal/evento-animal.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { EventoAnimalService } from './evento-animal.service';
import { CreateEventoAnimalDto } from './dto/create-evento-animal.dto';
import { UpdateEventoAnimalDto } from './dto/update-evento-animal.dto';
// Importa guards si los usas
// import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } from '../auth/enums/role.enum';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('eventos-animal')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class EventoAnimalController {
  constructor(private readonly evento_animal_service: EventoAnimalService) {}

  @Post()
  // @Roles(Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async crear(@Body() create_dto: CreateEventoAnimalDto) {
    return this.evento_animal_service.crear(create_dto);
  }

  @Get()
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_todos() {
    return this.evento_animal_service.obtener_todos();
  }

  @Get(':id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_por_id(@Param('id') id: string) {
    return this.evento_animal_service.obtener_por_id(+id);
  }

  @Patch(':id')
  // @Roles(Role.SUPERVISOR, Role.VETERINARIO)
  async actualizar(@Param('id') id: string, @Body() update_dto: UpdateEventoAnimalDto) {
    return this.evento_animal_service.actualizar(+id, update_dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(Role.SUPERVISOR)
  async eliminar(@Param('id') id: string) {
    await this.evento_animal_service.eliminar(+id);
  }

  @Get('por-animal/:animal_id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_eventos_por_animal(@Param('animal_id') animal_id: string) {
    return this.evento_animal_service.obtener_eventos_por_animal(+animal_id);
  }
}