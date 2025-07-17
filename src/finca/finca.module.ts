// src/finca/finca.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FincaService } from './finca.service';
import { FincaController } from './finca.controller';
import { Finca } from './entities/finca.entity';
import { Potrero } from 'src/potrero/entities/potrero.entity';
// import {Animal}
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { UsuarioFinca } from './entities/usuario-finca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Finca, Potrero, Usuario, UsuarioFinca])],
  controllers: [FincaController],
  providers: [FincaService],
  exports: [FincaService, TypeOrmModule] // Exporta el servicio y TypeOrmModule para ser usados en otros módulos si es necesario
})
export class FincaModule {}