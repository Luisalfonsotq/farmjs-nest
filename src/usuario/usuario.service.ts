// src/usuario/usuario.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> { // Retorna Usuario completo
    const existingUser = await this.usuarioRepository.findOne({ where: { email: createUsuarioDto.email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado.');
    }

    const newUser = this.usuarioRepository.create(createUsuarioDto);
    const savedUser = await this.usuarioRepository.save(newUser); // El hook BeforeInsert hashea la contraseña

    return savedUser; // Retorna la instancia completa de Usuario
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.createQueryBuilder('usuario')
      .addSelect('usuario.password') // Necesitamos la contraseña para validación
      .where('usuario.email = :email', { email })
      .getOne();
  }

  async findAll(): Promise<Usuario[]> { // Retorna array de Usuario completo
    return this.usuarioRepository.find(); // select: false ya ayuda aquí
  }

  async findOne(id: number): Promise<Usuario> { // Retorna Usuario completo
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> { // Retorna Usuario completo
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
