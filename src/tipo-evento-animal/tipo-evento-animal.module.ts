// src/tipo-evento-animal/tipo-evento-animal.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoEventoAnimalService } from './tipo-evento-animal.service';
import { TipoEventoAnimalController } from './tipo-evento-animal.controller';
import { TipoEventoAnimal } from './entities/tipo-evento-animal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoEventoAnimal])],
  controllers: [TipoEventoAnimalController],
  providers: [TipoEventoAnimalService],
  exports: [TipoEventoAnimalService], // Para EventoAnimalService
})
export class TipoEventoAnimalModule {}