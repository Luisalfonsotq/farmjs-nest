import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { Auditoria } from './entities/auditoria.entity';
import { FincaModule } from '../finca/finca.module';

@Module({
  imports: [TypeOrmModule.forFeature([Auditoria]), FincaModule],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule { }
