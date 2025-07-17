// src/usuario/entities/usuario.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Finca } from '../../finca/entities/finca.entity';
import { UsuarioFinca } from 'src/finca/entities/usuario-finca.entity';
import { Exclude } from 'class-transformer';
import { ControlSanitario } from 'src/control-sanitario/entities/control-sanitario.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Exclude() // <-- Añade este decorador para excluir la contraseña de las respuestas JSON
  @Column({ type: 'varchar', length: 255, nullable: false, select: false }) // 'select: false' ya ayuda a no cargarla por defecto
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: false, default: 'colaborador' })
  rol: string;

  @OneToMany(() => Finca, finca => finca.propietario)
  fincasPropietarias: Finca[];

  // Relación inversa para UsuarioFinca (para la gestión de las fincas)
  @OneToMany(() => UsuarioFinca, usuarioFinca => usuarioFinca.usuario)
  usuarioFincas: UsuarioFinca[];

  @OneToMany(() => ControlSanitario, control => control.veterinario)
  controles_sanitarios_realizados: ControlSanitario[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // @DeleteDateColumn()
  // deleted_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length < 60) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
