// src/invitacion/invitacion.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitacionService } from './invitacion.service';
import { InvitacionController } from './invitacion.controller';
import { Invitacion } from './entities/invitacion.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { UsuarioFinca } from '../finca/entities/usuario-finca.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitacion, Usuario, UsuarioFinca])
  ],
  controllers: [InvitacionController],
  providers: [InvitacionService],
  exports: [InvitacionService]
})
export class InvitacionModule {}
