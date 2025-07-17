// src/reproduccion/reproduccion.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReproduccionService } from './reproduccion.service';
import { ReproduccionController } from './reproduccion.controller';
import { Reproduccion } from './entities/reproduccion.entity';
import { Animal } from '../animal/entities/animal.entity'; // Importa Animal

@Module({
  imports: [TypeOrmModule.forFeature([Reproduccion, Animal])],
  controllers: [ReproduccionController],
  providers: [ReproduccionService],
  exports: [ReproduccionService],
})
export class ReproduccionModule {}