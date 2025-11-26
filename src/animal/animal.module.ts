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
import { UsuarioFinca } from '../finca/entities/usuario-finca.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Animal,
      Finca,
      Potrero,
      Proveedor,
      Reproduccion,
      UsuarioFinca
    ]),
  ],
  controllers: [AnimalController],
  providers: [AnimalService, AnimalScheduleService],
  exports: [AnimalService, AnimalScheduleService],
})
export class AnimalModule { }