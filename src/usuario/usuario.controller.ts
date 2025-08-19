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

  // ✅ Endpoint público para el registro de usuarios
  // Este es el único endpoint que no necesita un guard de autenticación
  // y se encargará de llamar al método `create` del servicio.
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    // Llama al método `create` que no tiene la lógica de forzar el rol
    return this.usuarioService.create(createUsuarioDto);
  }

  // ✅ Endpoint para que los administradores creen nuevos usuarios
  @Post()
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createByAdmin(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req) {
    // Llama al nuevo método `createOrUpdateByAdmin` y le pasa el usuario que está haciendo la petición
    return this.usuarioService.createOrUpdateByAdmin(createUsuarioDto, req.user);
  }

  // ✅ Endpoint para listar todos los usuarios (solo para administradores)
  @Get()
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.usuarioService.findAll();
  }

  // ✅ Endpoint para obtener un usuario por ID (protegido)
  @Get(':id')
  @UseGuards(JwtAuthGuard) // Puede ser accedido por cualquier usuario autenticado
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id);
  }

  // ✅ Endpoint para que los administradores actualicen usuarios
  @Patch(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) { 
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  // ✅ Endpoint para que los administradores eliminen usuarios
  @Delete(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }
}
