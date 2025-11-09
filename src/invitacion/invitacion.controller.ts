// src/invitacion/invitacion.controller.ts
import { Controller, Post, Get, Body, Param, Delete, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { InvitacionService } from './invitacion.service';
import { CreateInvitacionDto } from './dto/create-invitacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '../usuario/entities/usuario.entity';

@Controller('invitaciones')
export class InvitacionController {
  constructor(private readonly invitacionService: InvitacionService) {}

  // Crear invitación (solo admins de la finca)
  @Post('finca/:fincaId')
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('fincaId') fincaId: string,
    @Body() createInvitacionDto: CreateInvitacionDto
  ) {
    return await this.invitacionService.create(+fincaId, createInvitacionDto);
  }

  // Listar invitaciones de una finca (solo admins)
  @Get('finca/:fincaId')
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findByFinca(@Param('fincaId') fincaId: string) {
    return await this.invitacionService.findByFinca(+fincaId);
  }

  // Obtener invitación por token (público - para mostrar detalles)
  @Get('token/:token')
  async findByToken(@Param('token') token: string) {
    return await this.invitacionService.findByToken(token);
  }

  // Aceptar invitación (usuario autenticado)
  @Post('aceptar/:token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async aceptar(@Param('token') token: string, @Request() req) {
    return await this.invitacionService.aceptar(token, req.user.id);
  }

  // Rechazar invitación (público o autenticado)
  @Post('rechazar/:token')
  @HttpCode(HttpStatus.OK)
  async rechazar(@Param('token') token: string) {
    return await this.invitacionService.rechazar(token);
  }

  // Cancelar invitación (solo admins)
  @Delete(':id/finca/:fincaId')
  @Roles(RolUsuario.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelar(
    @Param('id') id: string,
    @Param('fincaId') fincaId: string
  ) {
    await this.invitacionService.cancelar(+id, +fincaId);
  }
}