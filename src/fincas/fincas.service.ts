import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Finca } from './fincas.entity';
import { CreateFincaDto } from './dto/create-fincas.dto';
import { User } from '../users/user.entity';

@Injectable()
export class FincaService {
  constructor(
    @InjectRepository(Finca)
    private fincaRepository: Repository<Finca>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateFincaDto): Promise<Finca> {
    const finca = this.fincaRepository.create(dto);

    if (dto.propietario_id) {
      const propietario = await this.userRepository.findOne({
        where: { id: dto.propietario_id },
      });
      if (!propietario) throw new NotFoundException('Propietario no encontrado');
      finca.propietario = propietario;
    }

    return this.fincaRepository.save(finca);
  }

  findAll(): Promise<Finca[]> {
    return this.fincaRepository.find();
  }

  async findOne(id: number): Promise<Finca> {
    const finca = await this.fincaRepository.findOne({ where: { id } });
    if (!finca) throw new NotFoundException('Finca no encontrada');
    return finca;
  }

  async remove(id: number): Promise<void> {
    const finca = await this.findOne(id);
    await this.fincaRepository.remove(finca);
  }
}
