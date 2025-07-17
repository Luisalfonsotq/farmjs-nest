// src/cria/cria.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriaService } from './cria.service';
import { CriaController } from './cria.controller';
import { Cria } from './entities/cria.entity';
import { Animal } from '../animal/entities/animal.entity'; // Importa Animal

@Module({
  imports: [TypeOrmModule.forFeature([Cria, Animal])],
  controllers: [CriaController],
  providers: [CriaService],
  exports: [CriaService],
})
export class CriaModule {}