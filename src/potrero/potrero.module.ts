// src/potrero/potrero.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PotreroService } from './potrero.service';
import { PotreroController } from './potrero.controller';
import { Potrero } from './entities/potrero.entity';
import { Finca } from '../finca/entities/finca.entity';
import { Animal } from '../animal/entities/animal.entity';
import { UsuarioFinca } from '../finca/entities/usuario-finca.entity'; // ← necesaria para FincaAccessGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([Potrero, Finca, Animal, UsuarioFinca]),
  ],
  controllers: [PotreroController],
  providers: [PotreroService],
  exports: [PotreroService],
})
export class PotreroModule { }