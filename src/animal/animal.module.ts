// src/animal/animal.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Asegúrate de importar TypeOrmModule

import { AnimalService } from './animal.service';
import { AnimalController } from './animal.controller';
import { Animal } from './entities/animal.entity';
import { Finca } from '../finca/entities/finca.entity'; // Importa Finca
import { Potrero } from '../potrero/entities/potrero.entity'; // Importa Potrero
import { Proveedor } from '../proveedor/entities/proveedor.entity'; // Importa Proveedor

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Animal,     // Para AnimalRepository
      Finca,      // Para FincaRepository
      Potrero,    // Para PotreroRepository
      Proveedor,  // Para ProveedorRepository
    ]),
  ],
  controllers: [AnimalController],
  providers: [AnimalService],
  exports: [AnimalService, TypeOrmModule], // Opcional: Exporta AnimalService si otros módulos lo usarán
})
export class AnimalModule {}