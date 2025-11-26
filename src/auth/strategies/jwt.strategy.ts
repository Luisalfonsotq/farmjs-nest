// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsuarioService } from '../../usuario/usuario.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usuarioService: UsuarioService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new InternalServerErrorException('JWT_SECRET environment variable is not defined.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token || null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usuarioService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o token inválido.');
    }

    // ✅ CAMBIO: Retornar estructura consistente con "id" en lugar de "userId"
    return {
      id: payload.sub,        // ✅ Ahora usa "id"
      email: payload.email,
      rol: payload.rol,       // ✅ "rol" permanece igual
      nombre: user.nombre
    };
  }
}