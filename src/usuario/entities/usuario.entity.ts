// src/usuario/entities/usuario.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Finca } from '../../finca/entities/finca.entity';
import { UsuarioFinca } from '../../finca/entities/usuario-finca.entity'; // Asegúrate de que la ruta sea correcta
import { Exclude } from 'class-transformer';
import { ControlSanitario } from '../../control-sanitario/entities/control-sanitario.entity'; // Asegúrate de que la ruta sea correcta

// 🐮 ⬅️ ENUM DE ROLES DE USUARIO
export enum RolUsuario {
  ADMINISTRADOR = 'Administrador',
  SUPERVISOR = 'Supervisor',
  VETERINARIO = 'Veterinario',
  COLABORADOR = 'Colaborador',
}

@Entity('usuarios') // Nombre de la tabla en la base de datos
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Exclude() // Excluye la contraseña de las respuestas JSON por seguridad
  @Column({ type: 'varchar', length: 255, nullable: false, select: false }) // 'select: false' evita que se cargue por defecto en las consultas
  password: string;

  // 🐮 ⬅️ USO DEL ENUM PARA EL ROL
  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.COLABORADOR, nullable: false })
  rol: RolUsuario; // Ahora es de tipo RolUsuario

  @OneToMany(() => Finca, finca => finca.propietario)
  fincasPropietarias: Finca[];

  // Relación inversa para UsuarioFinca (para la gestión de las fincas)
  @OneToMany(() => UsuarioFinca, usuarioFinca => usuarioFinca.usuario)
  usuarioFincas: UsuarioFinca[];

  @OneToMany(() => ControlSanitario, control_sanitario => control_sanitario.veterinario) // Ajustado a control_sanitario
  controles_sanitarios_realizados: ControlSanitario[]; // Nombre de la propiedad inversa más claro

  @CreateDateColumn({ name: 'created_at' }) // Nombre explícito para la columna en BD
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' }) // Nombre explícito para la columna en BD
  updated_at: Date;

  // Si decides reincorporar el soft delete:
  // @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  // deleted_at: Date | null;

  // 🐮 ⬅️ LÓGICA DE HASH DE CONTRASEÑA
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Solo hashea si la contraseña ha cambiado O si es una inserción y no ha sido hasheada.
    // La condición `this.password.length < 60` es una heurística para verificar si ya está hasheada
    // (un hash bcrypt es típicamente de longitud 60).
    if (this.password && this.password.length < 60) {
      this.password = await bcrypt.hash(this.password, 10); // '10' es el factor de costo (rounds)
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}