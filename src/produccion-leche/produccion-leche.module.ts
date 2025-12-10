import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduccionLecheService } from './produccion-leche.service';
import { ProduccionLecheController } from './produccion-leche.controller';
import { ProduccionLeche } from './entities/produccion-leche.entity';
import { Animal } from '../animal/entities/animal.entity';
import { Finca } from '../finca/entities/finca.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProduccionLeche, Animal, Finca])],
    controllers: [ProduccionLecheController],
    providers: [ProduccionLecheService],
    exports: [ProduccionLecheService],
})
export class ProduccionLecheModule { }
