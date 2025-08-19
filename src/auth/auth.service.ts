// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/usuario.service';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { LoginUsuarioDto } from '../usuario/dto/login-usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) { }

  async login(loginUsuarioDto: LoginUsuarioDto) {
    const usuario = await this.usuarioService.findByEmail(loginUsuarioDto.email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const isMatch = await bcrypt.compare(loginUsuarioDto.password, usuario.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // El payload del JWT
    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async validateUser(payload: any) {
    const user = await this.usuarioService.findByEmail(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    const { password: _, ...result } = user;
    return result;
  }

  // ✅ Nuevo método que combina registro y login
  async registerAndLogin(createUsuarioDto: CreateUsuarioDto) {
    try {
      // 1. Llama al método de creación de usuario para registrar
      const newUser = await this.usuarioService.create(createUsuarioDto);

      // 2. Si el registro es exitoso, crea un DTO para el login
      const loginDtoForNewUser: LoginUsuarioDto = {
        email: createUsuarioDto.email,
        password: createUsuarioDto.password,
      };

      // 3. Llama al método de login y retorna el resultado (incluyendo el token)
      return this.login(loginDtoForNewUser);
    } catch (error) {
      // Maneja errores específicos como correos duplicados
      if (error instanceof ConflictException) {
        throw new BadRequestException('El email ya está registrado.');
      }
      throw error;
    }
  }
}
