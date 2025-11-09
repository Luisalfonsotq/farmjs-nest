// // src/auth/strategies/jwt.strategy.ts
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { UsuarioService } from '../../usuario/usuario.service';
// import { Request } from 'express';

// export interface JwtPayload {
//   sub: number;
//   email: string;
//   rol: string;
// }

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private configService: ConfigService,
//     private usuarioService: UsuarioService,
//   ) {
//     const jwtSecret = configService.get<string>('JWT_SECRET');

//     // *** CAMBIO AQUÍ: Validamos explícitamente la variable de entorno ***
//     if (!jwtSecret) {
//       throw new InternalServerErrorException('JWT_SECRET environment variable is not defined.');
//     }

//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (request: Request) => {
//           // Busca el token en la cookie 'access_token' sino existe retorna null
//           return request?.cookies?.access_token || null;
//         },
//       ]),
//       ignoreExpiration: false,
//       secretOrKey: jwtSecret, // Ahora 'jwtSecret' es un string
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const user = await this.usuarioService.findOne(payload.sub);
//     if (!user) {
//       throw new UnauthorizedException('Usuario no encontrado o token inválido.');
//     }
//     return { userId: payload.sub, email: payload.email, rol: payload.rol, nombre: user.nombre };
//   }
// }

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