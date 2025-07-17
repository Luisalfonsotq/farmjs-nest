// src/tipo-control-sanitario/tipo-control-sanitario.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoControlSanitarioService } from './tipo-control-sanitario.service';
import { TipoControlSanitarioController } from './tipo-control-sanitario.controller';
import { TipoControlSanitario } from './entities/tipo-control-sanitario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoControlSanitario])],
  controllers: [TipoControlSanitarioController],
  providers: [TipoControlSanitarioService],
  exports: [TipoControlSanitarioService], // Para ControlSanitarioService
})
export class TipoControlSanitarioModule {}