// src/finca/entities/usuario-finca.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { Finca } from "./finca.entity";

@Entity('UsuarioFinca')
export class UsuarioFinca {
  @PrimaryColumn({ name: 'usuario_id' })
  usuarioId: number;

  @PrimaryColumn({ name: 'finca_id' })
  fincaId: number;

  @ManyToOne(() => Usuario, usuario => usuario.usuarioFincas)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Finca, finca => finca.usuariosFincas)
  @JoinColumn({ name: 'finca_id' })
  finca: Finca;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}