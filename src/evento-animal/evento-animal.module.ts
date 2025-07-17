// src/evento-animal/evento-animal.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoAnimalService } from './evento-animal.service';
import { EventoAnimalController } from './evento-animal.controller';
import { EventoAnimal } from './entities/evento-animal.entity';
import { Animal } from '../animal/entities/animal.entity';
import { TipoEventoAnimal } from '../tipo-evento-animal/entities/tipo-evento-animal.entity';
import { Potrero } from '../potrero/entities/potrero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventoAnimal, Animal, TipoEventoAnimal, Potrero])],
  controllers: [EventoAnimalController],
  providers: [EventoAnimalService],
  exports: [EventoAnimalService],
})
export class EventoAnimalModule {}