// src/tarea/tarea.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TareaService } from './tarea.service';
import { TareaController } from './tarea.controller';
import { Tarea } from './entities/tarea.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tarea])],
    controllers: [TareaController],
    providers: [TareaService],
    exports: [TareaService],
})
export class TareaModule { }
