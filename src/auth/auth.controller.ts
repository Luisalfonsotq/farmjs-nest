// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUsuarioDto } from '../usuario/dto/login-usuario.dto'; 
import { AuthGuard } from '@nestjs/passport';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { response, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUsuarioDto: CreateUsuarioDto, @Res({ passthrough: true}) response: Response) {
    const {access_token, user} = await this.authService.registerAndLogin(createUsuarioDto);
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    })
    return {user};
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUsuarioDto: LoginUsuarioDto, @Res({passthrough: true}) response: Response) {
    const {access_token, user} = await this.authService.login(loginUsuarioDto);

    // Establece el token en una cookie httpOnly mucho más segura que local storage
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ?'strict' : 'lax',
      path: '/',
      maxAge: 3600000, // 1 hora
    });
    return { user};
  }

  //Cerrar sesión
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true})response: Response){
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/'
    });
    return { message: 'Sesión cerrada exitosamente'};
  }

  // Ruta protegida
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}