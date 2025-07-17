// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUsuarioDto } from '../usuario/dto/login-usuario.dto'; // DTO para login
import { AuthGuard } from '@nestjs/passport';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto'; // DTO para registro

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUsuarioDto: CreateUsuarioDto) { // Usamos CreateUsuarioDto para el registro
    return this.authService.register(createUsuarioDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.authService.login(loginUsuarioDto);
  }

  // Ruta protegida de ejemplo para ver cómo funciona el JWT
  @UseGuards(AuthGuard('jwt')) // Protege esta ruta con la estrategia 'jwt'
  @Get('profile')
  getProfile(@Request() req) {
    // `req.user` contendrá los datos devueltos por `JwtStrategy.validate()`
    return req.user;
  }
}