// src/control-sanitario/control-sanitario.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControlSanitarioService } from './control-sanitario.service';
import { ControlSanitarioController } from './control-sanitario.controller';
import { ControlSanitario } from './entities/control-sanitario.entity';
import { Animal } from '../animal/entities/animal.entity';
import { TipoControlSanitario } from '../tipo-control-sanitario/entities/tipo-control-sanitario.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ControlSanitario, Animal, TipoControlSanitario, Usuario])],
  controllers: [ControlSanitarioController],
  providers: [ControlSanitarioService],
  exports: [ControlSanitarioService],
})
export class ControlSanitarioModule {}