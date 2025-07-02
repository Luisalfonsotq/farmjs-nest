import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FincaService } from './fincas.service';
import { CreateFincaDto } from './dto/create-fincas.dto';
import { Finca } from './fincas.entity';

@Controller('fincas')
export class FincaController {
  constructor(private readonly fincaService: FincaService) {}

  @Post()
  create(@Body() dto: CreateFincaDto): Promise<Finca> {
    return this.fincaService.create(dto);
  }

  @Get()
  findAll(): Promise<Finca[]> {
    return this.fincaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Finca> {
    return this.fincaService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.fincaService.remove(id);
  }
}
