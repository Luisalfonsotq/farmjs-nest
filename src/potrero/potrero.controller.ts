// src/potrero/potrero.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { PotreroService } from './potrero.service';
import { CreatePotreroDto } from './dto/create-potrero.dto';
import { UpdatePotreroDto } from './dto/update-potrero.dto';
// Importa los guards y decoradores si ya los tienes para auth/roles
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('potreros')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class PotreroController {
  constructor(private readonly potreroService: PotreroService) {}

  @Post()
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR)
  async create(@Body() createPotreroDto: CreatePotreroDto) {
    return this.potreroService.create(createPotreroDto);
  }

  @Get()
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async findAll() {
    return this.potreroService.findAll();
  }

  @Get(':id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async findOne(@Param('id') id: string) {
    return this.potreroService.findOne(+id);
  }

  @Patch(':id')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR)
  async update(@Param('id') id: string, @Body() updatePotreroDto: UpdatePotreroDto) {
    return this.potreroService.update(+id, updatePotreroDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR)
  async remove(@Param('id') id: string) {
    await this.potreroService.remove(+id);
  }

  @Get('by-finca/:fincaId')
  // @Roles(Role.ADMINISTRADOR, Role.SUPERVISOR, Role.VETERINARIO, Role.COLABORADOR)
  async findPotrerosByFinca(@Param('fincaId') fincaId: string) {
    return this.potreroService.findPotrerosByFinca(+fincaId);
  }
}