// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUsuarioDto } from '../usuario/dto/login-usuario.dto';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto'; // Importa tu DTO existente

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const usuario = await this.usuarioService.findByEmail(email); // findByEmail debe seleccionar la contraseña
    if (!usuario) {
      return null;
    }

    const isMatch = await usuario.comparePassword(password);
    if (!isMatch) {
      return null;
    }

    // Si todo es válido, retorna el usuario sin la contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = usuario;
    return result;
  }

  async login(loginUsuarioDto: LoginUsuarioDto) {
    const usuario = await this.validateUser(loginUsuarioDto.email, loginUsuarioDto.password);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // El payload del JWT
    const payload = { email: usuario.email, sub: usuario.id, rol: usuario.rol };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  // Función de registro
  async register(createUsuarioDto: CreateUsuarioDto) { // Usa tu CreateUsuarioDto existente
    try {
      // El servicio de usuario debe manejar la creación, el hasheo de la contraseña
      // y la verificación de duplicados de email.
      // Aquí simplemente pasamos todo el DTO, incluyendo 'nombre' y 'rol' si vienen.
      const newUser = await this.usuarioService.create(createUsuarioDto); 

      // Si el registro es exitoso, inicia sesión al nuevo usuario
      const loginDtoForNewUser: LoginUsuarioDto = {
        email: createUsuarioDto.email,
        password: createUsuarioDto.password,
      };
      
      return this.login(loginDtoForNewUser);
    } catch (error) {
      // Asumiendo que usuarioService.create lanza un ConflictException para emails duplicados
      if (error instanceof ConflictException) { 
        throw new BadRequestException('El email ya está registrado.');
      }
      throw error; // Re-lanza otros errores
    }
  }
}
