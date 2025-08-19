// src/usuario/usuario.service.ts
import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolUsuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  // ✅ Método para la creación inicial desde el registro público
  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const existingUser = await this.usuarioRepository.findOne({ where: { email: createUsuarioDto.email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado.');
    }

    // Se asume que el DTO del registro público no tiene un 'usuarioActual'
    // y el rol viene directamente del frontend
    const newUser = this.usuarioRepository.create(createUsuarioDto);
    return await this.usuarioRepository.save(newUser);
  }

  // ✅ Nuevo método para que un administrador cree o actualice un usuario
  async createOrUpdateByAdmin(createUsuarioDto: CreateUsuarioDto, usuarioActual: Usuario): Promise<Usuario> {
    // Si el usuario autenticado no es un administrador, lanza un error de autorización
    if (usuarioActual.rol !== RolUsuario.ADMINISTRADOR) {
      throw new UnauthorizedException('Solo los administradores pueden crear o modificar usuarios de esta manera.');
    }

    const existingUser = await this.usuarioRepository.findOne({ where: { email: createUsuarioDto.email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado.');
    }

    // El administrador puede especificar el rol, no se fuerza
    const newUser = this.usuarioRepository.create(createUsuarioDto);
    return await this.usuarioRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .where('usuario.email = :email', { email })
      .getOne();

    if (!usuario) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado.`);
    }

    return usuario;
  }

  async findAll(): Promise<Usuario[]> { 
    return this.usuarioRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> { 
    const usuario = await this.usuarioRepository.preload({ id, ...updateUsuarioDto });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    const updatedUser = await this.usuarioRepository.save(usuario);
    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usuarioRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
  }
}
