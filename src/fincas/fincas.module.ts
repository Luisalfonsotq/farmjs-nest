import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finca } from './fincas.entity';
import { FincaService } from './fincas.service';
import { FincaController } from './fincas.controller';
import { User } from '../users/user.entity'; // Asegúrate que el path esté bien

@Module({
  imports: [TypeOrmModule.forFeature([Finca, User])],
  controllers: [FincaController],
  providers: [FincaService],
})
export class FincasModule {}
