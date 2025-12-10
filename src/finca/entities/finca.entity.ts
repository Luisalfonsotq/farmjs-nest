// src/finca/entities/finca.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Potrero } from '../../potrero/entities/potrero.entity';
import { Animal } from '../../animal/entities/animal.entity';
import { UsuarioFinca } from './usuario-finca.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { ProduccionLeche } from '../../produccion-leche/entities/produccion-leche.entity';

@Entity('fincas')
export class Finca {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ubicacion: string;

  // Coordenadas geográficas para ubicación en mapa
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    comment: 'Latitud de la ubicación de la finca'
  })
  latitud: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    comment: 'Longitud de la ubicación de la finca'
  })
  longitud: number | null;

  // Relacion con el usuario propietario (1:N, usuario puede ser propietario de varias fincas).
  @ManyToOne(() => Usuario, usuario => usuario.fincasPropietarias)
  @JoinColumn({ name: 'propietario_id' })
  propietario: Usuario;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tamano_ha: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  eliminado_en: Date | null;

  // Relaciones inversas (OneToMany) con potrero
  @OneToMany(() => Potrero, potrero => potrero.finca)
  potreros: Potrero[];

  //Relación OneToMany con Animal
  @OneToMany(() => Animal, animal => animal.finca)
  animales: Animal[];

  // Relación ManyToMany con Usuario a través de UsuarioFinca (para gestión)
  @OneToMany(() => UsuarioFinca, usuarioFinca => usuarioFinca.finca)
  usuariosFincas: UsuarioFinca[];

  @OneToMany(() => ProduccionLeche, produccion => produccion.finca)
  producciones_leche: ProduccionLeche[];

}

