// src/reportes/reportes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';

import { Animal } from '../animal/entities/animal.entity';
import { ProduccionLeche } from '../produccion-leche/entities/produccion-leche.entity';
import { Reproduccion } from '../reproduccion/entities/reproduccion.entity';
import { ControlSanitario } from '../control-sanitario/entities/control-sanitario.entity';
import { EventoAnimal } from '../evento-animal/entities/evento-animal.entity';
import { TipoEventoAnimal } from '../tipo-evento-animal/entities/tipo-evento-animal.entity';
import { Cria } from '../cria/entities/cria.entity';
import { Finca } from '../finca/entities/finca.entity';
import { UsuarioFinca } from '../finca/entities/usuario-finca.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Animal,
            ProduccionLeche,
            Reproduccion,
            ControlSanitario,
            EventoAnimal,
            TipoEventoAnimal,
            Cria,
            Finca,
            UsuarioFinca,
        ]),
    ],
    controllers: [ReportesController],
    providers: [ReportesService],
    exports: [ReportesService],
})
export class ReportesModule { }
