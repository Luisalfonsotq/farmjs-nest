// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from '../usuario/usuario.module'; // Importa UsuarioModule para usar UsuarioService
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Para acceder a las variables de entorno

@Module({
  imports: [
    UsuarioModule, // Necesitamos el UsuarioService para validar credenciales
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa ConfigModule para usar ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Obtiene el secreto de las variables de entorno
        signOptions: { expiresIn: '1h' }, // El token expira en 1 hora
      }),
      inject: [ConfigService], // Inyecta ConfigService
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // JwtStrategy necesita ser un provider
  exports: [AuthService], // Exportamos AuthService si otros módulos necesitan usarlo (ej. para verificar tokens internamente)
})
export class AuthModule {}