// src/cria/cria.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CriaService } from './cria.service';
import { CreateCriaDto } from './dto/create-cria.dto';
import { UpdateCriaDto } from './dto/update-cria.dto';
// Importa guards si los usas
// import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } from '../auth/enums/role.enum';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('crias')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class CriaController {
  constructor(private readonly cria_service: CriaService) {}

  @Post()
  // @Roles(Role.VETERINARIO, Role.SUPERVISOR)
  async crear(@Body() create_dto: CreateCriaDto) {
    return this.cria_service.crear(create_dto);
  }

  @Get()
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_todos() {
    return this.cria_service.obtener_todos();
  }

  @Get(':id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_por_id(@Param('id') id: string) {
    return this.cria_service.obtener_por_id(+id);
  }

  @Patch(':id')
  // @Roles(Role.VETERINARIO, Role.SUPERVISOR)
  async actualizar(@Param('id') id: string, @Body() update_dto: UpdateCriaDto) {
    return this.cria_service.actualizar(+id, update_dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(Role.VETERINARIO, Role.SUPERVISOR)
  async eliminar(@Param('id') id: string) {
    await this.cria_service.eliminar(+id);
  }

  @Get('por-madre/:madre_id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_crias_por_madre(@Param('madre_id') madre_id: string) {
    return this.cria_service.obtener_crias_por_madre(+madre_id);
  }

  @Get('por-padre/:padre_id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_crias_por_padre(@Param('padre_id') padre_id: string) {
    return this.cria_service.obtener_crias_por_padre(+padre_id);
  }
}