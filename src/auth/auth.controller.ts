import { Controller, Post, Body, Get, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from './decorators/user.decorator';

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


