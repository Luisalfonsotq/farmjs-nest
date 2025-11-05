// src/usuario/usuario.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RolUsuario } from './entities/usuario.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { RolesGuard } from '../auth/guards/roles.guard'; 
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // Endpoint público para registro - siempre asigna rol PENDING 
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  // Solo administradores crean nuevos usuarios con roles específicos
  @Post()
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createByAdmin(@Body() createUsuarioDto: CreateUsuarioDto & {rol?: RolUsuario}, @Request() req) {
    return this.usuarioService.createOrUpdateByAdmin(createUsuarioDto, req.user);
  }

  // NUEVO: Endpoint para aprobar usuarios pendientes
  @Patch(':id/aprobar')
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async aprobarUsuario(
    @Param('id') id: string,
    @Body('rol') nuevoRol: RolUsuario,
    @Request() req
  ){
    return this.usuarioService.aprobarUsuario(+id, nuevoRol, req.user);
  }

  // Listar todos los usuarios (solo para administradores)
  @Get()
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.usuarioService.findAll();
  }

  // Obtener un usuario por ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id);
  }

  // Actualizar usuario (solo administradores)
  @Patch(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) { 
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  // Eliminar usuarios (solo administradores)
  @Delete(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }
}
