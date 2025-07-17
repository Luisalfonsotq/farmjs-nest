// src/proveedor/proveedor.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
// Importa guards si los usas
// import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } from '../auth/enums/role.enum';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('proveedores')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProveedorController {
  constructor(private readonly proveedor_service: ProveedorService) {}

  @Post()
  // @Roles(Role.ADMINISTRADOR)
  async crear(@Body() create_proveedor_dto: CreateProveedorDto) {
    return this.proveedor_service.crear(create_proveedor_dto);
  }

  @Get()
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_todos() {
    return this.proveedor_service.obtener_todos();
  }

  @Get(':id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async obtener_por_id(@Param('id') id: string) {
    return this.proveedor_service.obtener_por_id(+id);
  }

  @Patch(':id')
  // @Roles(Role.ADMINISTRADOR)
  async actualizar(@Param('id') id: string, @Body() update_proveedor_dto: UpdateProveedorDto) {
    return this.proveedor_service.actualizar(+id, update_proveedor_dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(Role.ADMINISTRADOR)
  async eliminar(@Param('id') id: string) {
    await this.proveedor_service.eliminar(+id);
  }
}