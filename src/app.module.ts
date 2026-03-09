// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

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


// Función de ayuda para obtener variables de entorno
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
      ],
      synchronize: false, // Cuando está en false, se conecta a la base de datos pero no crean ni modifican ninguna tabla
      // process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      // softDelete: true, // Descomenta si habilitas soft delete globalmente
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }