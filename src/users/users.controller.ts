import { Controller,Get,Post,Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, Role } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService:UsersService){}

    @Post()
    createUser(@Body() body: CreateUserDto): Promise<User>{
        return this.usersService.create(body);
    }

    @Get()
    findAll(): Promise<User[]>{
        return this.usersService.findAll();
    }

    // Ruta protegida slo por admin
    @Get('admin-only')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    adminOnlyRute(){
        return{
            message: 'acceso concedido: solo para administradores',
        };
    }
}
