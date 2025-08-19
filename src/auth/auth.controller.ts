// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUsuarioDto } from '../usuario/dto/login-usuario.dto'; 
import { AuthGuard } from '@nestjs/passport';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.registerAndLogin(createUsuarioDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUsuarioDto: LoginUsuarioDto, @Res({passthrough: true}) response: Response) {
    const {access_token, user} = await this.authService.login(loginUsuarioDto);

    // Establece el token en una cookie httpOnly mucho más segura que local storage
    response.cookie('access_token', access_token, {
      httpOnly: true, // No es accesible a través de js
      secure: process.env.NODE_ENV === 'production',
      // 'lax' permite el envío de la cookie en peticiones GET de origen cruzado
      sameSite: process.env.NODE_ENV === 'production' ?'strict' : 'lax', // Pretege contra CSRF
    });

    // Devuelve solo la info del usuario en el cuerpo de la respuesta
    return { user};
  }

  // Ruta protegida
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}