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

  // Registro público - SIEMPRE asigna rol PENDING
  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const existingUser = await this.usuarioRepository.findOne({ where: { email: createUsuarioDto.email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado.');
    }

    // FUERZA el rol a PENDING
    const newUser = this.usuarioRepository.create({
      ...createUsuarioDto,
      rol: RolUsuario.PENDING, // Rol inicial forzado para SaaS
    });

    return await this.usuarioRepository.save(newUser);
  }

  // Solo administradores pueden crear usuarios con roles específicos
  async createOrUpdateByAdmin(createUsuarioDto: CreateUsuarioDto & {rol?: RolUsuario}, usuarioActual: Usuario): Promise<Usuario> {
    if (usuarioActual.rol !== RolUsuario.ADMINISTRADOR) {
      throw new UnauthorizedException('Solo los administradores pueden crear usuarios con roles específicos.');
    }

    const existingUser = await this.usuarioRepository.findOne({ where: { email: createUsuarioDto.email } 
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado.');
    }

    // El administrador puede especificar el rol
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

  // Nuevo método para que el administrador apruebe usuarios pendientes
  async aprobarUsuario(id: number, nuevoRol: RolUsuario, adminActual: Usuario): Promise<Usuario>{
    if(adminActual.rol !== RolUsuario.ADMINISTRADOR){
      throw new UnauthorizedException('Solo los administradores pueden aprobar usuarios.')
    }
    const usuario = await this.findOne(id);

    if(usuario.rol !== RolUsuario.PENDING){
      throw new ConflictException('El usuario ya tiene un rol asignado.')
    }
    usuario.rol = nuevoRol;
    return await this.usuarioRepository.save(usuario);
  }

}
