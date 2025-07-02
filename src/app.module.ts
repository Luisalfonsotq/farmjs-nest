import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { config } from 'process';
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module';
import { FincasModule } from './fincas/fincas.module';
import { Finca } from './fincas/fincas.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, AuthModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '3306')),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'farmjs_db'),
        entities: [User, Finca],
        synchronize: true, // cambia a false en producción
      }),
    }),
    UsersModule,
    TypeOrmModule.forFeature([User]),
    AuthModule,
    FincasModule,
  ],
})
export class AppModule { }
