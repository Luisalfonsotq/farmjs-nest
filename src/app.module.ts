import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';


// Módulos
import { UsuarioModule } from './usuario/usuario.module';
import { FincaModule } from './finca/finca.module';
import { AuthModule } from './auth/auth.module';
import { PotreroModule } from './potrero/potrero.module';
import { AnimalModule } from './animal/animal.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { ControlSanitarioModule } from './control-sanitario/control-sanitario.module';
import { ReproduccionModule } from './reproduccion/reproduccion.module';
import { CriaModule } from './cria/cria.module';
import { TipoEventoAnimalModule } from './tipo-evento-animal/tipo-evento-animal.module';
import { EventoAnimalModule } from './evento-animal/evento-animal.module';
import { InvitacionModule } from './invitacion/invitacion.module';
import { ProduccionLecheModule } from './produccion-leche/produccion-leche.module';
import { ReportesModule } from './reportes/reportes.module';
import { TareaModule } from './tarea/tarea.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

// Entidades
import { Usuario } from './usuario/entities/usuario.entity';
import { Finca } from './finca/entities/finca.entity';
import { UsuarioFinca } from './finca/entities/usuario-finca.entity';
import { Potrero } from './potrero/entities/potrero.entity';
import { Animal } from './animal/entities/animal.entity';
import { Proveedor } from './proveedor/entities/proveedor.entity';
import { ControlSanitario } from './control-sanitario/entities/control-sanitario.entity';
import { Reproduccion } from './reproduccion/entities/reproduccion.entity';
import { Cria } from './cria/entities/cria.entity';
import { TipoEventoAnimal } from './tipo-evento-animal/entities/tipo-evento-animal.entity';
import { EventoAnimal } from './evento-animal/entities/evento-animal.entity';
import { Invitacion } from './invitacion/entities/invitacion.entity';
import { ProduccionLeche } from './produccion-leche/entities/produccion-leche.entity';
import { Tarea } from './tarea/entities/tarea.entity';
import { Auditoria } from './auditoria/entities/auditoria.entity';

import { AuditoriaInterceptor } from './auditoria/interceptors/auditoria.interceptor';

function getEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
}

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_URL,
      host: getEnv('DATABASE_HOST'),
      port: parseInt(getEnv('DATABASE_PORT') || '3306', 10),
      username: getEnv('DATABASE_USER'),
      password: getEnv('DATABASE_PASSWORD'),
      database: getEnv('DATABASE_NAME'),
      entities: [
        Usuario,
        Finca,
        UsuarioFinca,
        Potrero,
        Animal,
        Proveedor,
        ControlSanitario,
        Reproduccion,
        Cria,
        TipoEventoAnimal,
        EventoAnimal,
        Invitacion,
        ProduccionLeche,
        Tarea,
        Auditoria,
      ],
      synchronize: false, // Permite sincronizar la DB
      logging: process.env.NODE_ENV !== 'production',
      extra: {
        ssl: {
          rejectUnauthorized: false
        }
      }
    }),
    AuthModule,
    UsuarioModule,
    FincaModule,
    PotreroModule,
    AnimalModule,
    ProveedorModule,
    ControlSanitarioModule,
    ReproduccionModule,
    CriaModule,
    TipoEventoAnimalModule,
    EventoAnimalModule,
    InvitacionModule,
    ProduccionLecheModule,
    ReportesModule,
    TareaModule,
    AuditoriaModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditoriaInterceptor,
    },
  ],
})
export class AppModule { }