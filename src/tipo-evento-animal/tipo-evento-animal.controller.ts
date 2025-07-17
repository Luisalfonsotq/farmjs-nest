// src/tipo-evento-animal/tipo-evento-animal.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TipoEventoAnimalService } from './tipo-evento-animal.service';
import { CreateTipoEventoAnimalDto } from './dto/create-tipo-evento-animal.dto';
import { UpdateTipoEventoAnimalDto } from './dto/update-tipo-evento-animal.dto';
// Importa guards si los usas
// import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } from '../auth/enums/role.enum';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tipos-evento-animal')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class TipoEventoAnimalController {
  constructor(private readonly tipo_evento_animal_service: TipoEventoAnimalService) {}

  @Post()
  // @Roles(Role.ADMINISTRADOR)
  async crear(@Body() create_dto: CreateTipoEventoAnimalDto) {
    return this.tipo_evento_animal_service.crear(create_dto);
  }

  @Get()
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_todos() {
    return this.tipo_evento_animal_service.obtener_todos();
  }

  @Get(':id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_por_id(@Param('id') id: string) {
    return this.tipo_evento_animal_service.obtener_por_id(+id);
  }

  @Patch(':id')
  // @Roles(Role.ADMINISTRADOR)
  async actualizar(@Param('id') id: string, @Body() update_dto: UpdateTipoEventoAnimalDto) {
    return this.tipo_evento_animal_service.actualizar(+id, update_dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(Role.ADMINISTRADOR)
  async eliminar(@Param('id') id: string) {
    await this.tipo_evento_animal_service.eliminar(+id);
  }
}