// src/finca/finca.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Finca } from './entities/finca.entity';
import { UsuarioFinca } from './entities/usuario-finca.entity';
import { CreateFincaDto } from './dto/create-finca.dto';
import { UpdateFincaDto } from './dto/update-finca.dto';
import { AssignFincaDto } from './dto/assign-finca.dto';
import { Usuario } from 'src/usuario/entities/usuario.entity';


@Injectable()
export class FincaService {
  constructor(
    @InjectRepository(Finca)
    private fincaRepository: Repository<Finca>,
    @InjectRepository(UsuarioFinca)
    private usuarioFincaRepository: Repository<UsuarioFinca>,
    @InjectRepository(Usuario) //Para validar el propietario
    private usuarioRepository: Repository<Usuario>,
  ) { }

  async create(createFincaDto: CreateFincaDto): Promise<Finca> {
    const { propietario_id, ...fincaData } = createFincaDto;

    const propietario = await this.usuarioRepository.findOne({ where: { id: propietario_id } });
    if (!propietario) {
      throw new NotFoundException(`Usuario con ID ${propietario_id} no encontrado`)
    }

    // Validar que el rol del propietario sea 'administrador' o 'propietario'
    if (propietario.rol !== 'administrador' && propietario.rol !== 'propietario') {
      throw new BadRequestException('El usuario asignado como propietario no tiene el rol permitido');
    }

    const newfinca = this.fincaRepository.create({
      ...fincaData,
      propietario: propietario,
    });
    return this.fincaRepository.save(newfinca);
  }

  async findAll(): Promise<Finca[]> {
    return this.fincaRepository.find({ relations: ['propietario'] });
  }

  async findOne(id: number): Promise<Finca> {
    const finca = await this.fincaRepository.findOne({
      where: { id },
      relations: ['propietario', 'potreros', 'animales'],
    }); // Incluir relaciones
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${id} no encontrada.`);
    }
    return finca;
  }

  async update(id: number, updateFincaDto: UpdateFincaDto): Promise<Finca> {
    const finca = await this.findOne(id); // Reutiliza a findOne
    Object.assign(finca, updateFincaDto);
    return this.fincaRepository.save(finca);
  }

  async remove(id: number): Promise<void> {
    const result = await this.fincaRepository.softDelete(id); // Usa softDelete por el campo deleted_at
    if (result.affected === 0) {
      throw new NotFoundException(`Finca con ID ${id} no encontrada.`);
    }
  }

  async assignFincaToUser(assignFincaDto: AssignFincaDto): Promise<UsuarioFinca> {
    const { usuarioId, fincaId } = assignFincaDto;

    const user = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado.`);
    }
    const finca = await this.fincaRepository.findOne({ where: { id: fincaId } });
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${fincaId} no encontrada.`);
    }
  
  // Validar que el usuario tenga un rol que le permita gestionar fincas
    if (user.rol !== 'administrador' && user.rol !== 'supervisor') {
    throw new BadRequestException('El usuario no tiene el rol adecuado para gestionar fincas.');
    }

    const existingAssignment = await this.usuarioFincaRepository.findOne({
      where: { usuarioId, fincaId },
    });

    if (existingAssignment) {
      throw new BadRequestException(`El usuario ${user.nombre} ya está asignado a la finca ${finca.nombre}.`);
    }

    const assignment = this.usuarioFincaRepository.create({ usuarioId, fincaId });
    return this.usuarioFincaRepository.save(assignment);
  }

  async removeFincaFromUser(usuarioId: number, fincaId: number): Promise<void> {
    const result = await this.usuarioFincaRepository.delete({ usuarioId, fincaId });
    if (result.affected === 0) {
      throw new NotFoundException(`Asignación de usuario ${usuarioId} a finca ${fincaId} no encontrada.`);
    }
  }

  // Método para obtener fincas gestionadas por un usuario
  async getFincasManagedByUser(userId: number): Promise<Finca[]> {
    const userFincas = await this.usuarioFincaRepository.find({
      where: { usuarioId: userId },
      relations: ['finca'],
    });
    return userFincas.map(uf => uf.finca);
  }
}