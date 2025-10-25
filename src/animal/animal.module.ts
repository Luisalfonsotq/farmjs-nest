// src/animal/animal.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalService } from './animal.service';
import { AnimalController } from './animal.controller';
import { AnimalScheduleService } from './animal-schedule.service';
import { Animal } from './entities/animal.entity';
import { Finca } from '../finca/entities/finca.entity';
import { Potrero } from '../potrero/entities/potrero.entity';
import { Proveedor } from '../proveedor/entities/proveedor.entity'; 
import { Reproduccion } from '../reproduccion/entities/reproduccion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Animal,     
      Finca,      
      Potrero,
      Proveedor,
      Reproduccion
    ]),
  ],
  controllers: [AnimalController],
  providers: [AnimalService, AnimalScheduleService],
  exports: [AnimalService, AnimalScheduleService],
})
export class AnimalModule {}