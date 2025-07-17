// src/tipo-control-sanitario/tipo-control-sanitario.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TipoControlSanitarioService } from './tipo-control-sanitario.service';
import { CreateTipoControlSanitarioDto } from './dto/create-tipo-control-sanitario.dto';
import { UpdateTipoControlSanitarioDto } from './dto/update-tipo-control-sanitario.dto';
// Importa guards si los usas
// import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } => '../auth/enums/role.enum';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tipos-control-sanitario')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class TipoControlSanitarioController {
  constructor(private readonly tipo_control_sanitario_service: TipoControlSanitarioService) {}

  @Post()
  // @Roles(Role.ADMINISTRADOR)
  async crear(@Body() create_dto: CreateTipoControlSanitarioDto) {
    return this.tipo_control_sanitario_service.crear(create_dto);
  }

  @Get()
  // @Roles(Role.ADMINISTRADOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_todos() {
    return this.tipo_control_sanitario_service.obtener_todos();
  }

  @Get(':id')
  // @Roles(Role.ADMINISTRADOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_por_id(@Param('id') id: string) {
    return this.tipo_control_sanitario_service.obtener_por_id(+id);
  }

  @Patch(':id')
  // @Roles(Role.ADMINISTRADOR)
  async actualizar(@Param('id') id: string, @Body() update_dto: UpdateTipoControlSanitarioDto) {
    return this.tipo_control_sanitario_service.actualizar(+id, update_dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(Role.ADMINISTRADOR)
  async eliminar(@Param('id') id: string) {
    await this.tipo_control_sanitario_service.eliminar(+id);
  }
}