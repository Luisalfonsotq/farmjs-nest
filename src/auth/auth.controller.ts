import { Controller, Post, Body, Get, UseGuards,Request} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from './decorators/user.decorator';
import { Roles } from './roles.decorator';
import { only } from 'node:test';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    // Ruta protegida: /auth/profile
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@User() user: any){
        return{
            message: 'Ruta protegida con JWT',
            user,
        };
    }

}


