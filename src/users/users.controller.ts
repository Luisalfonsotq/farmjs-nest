import { Controller,Get,Post,Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, Role } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

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
}
