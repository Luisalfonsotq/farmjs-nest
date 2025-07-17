// src/potrero/potrero.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PotreroService } from './potrero.service';
import { PotreroController } from './potrero.controller';
import { Potrero } from './entities/potrero.entity';
import { Finca } from '../finca/entities/finca.entity'; // Importa Finca

@Module({
  imports: [TypeOrmModule.forFeature([Potrero, Finca])], // Importa Finca aquí para que PotreroService pueda usar su repositorio
  controllers: [PotreroController],
  providers: [PotreroService],
  exports: [PotreroService], // Exporta si Animal u otros módulos lo necesitarán
})
export class PotreroModule {}