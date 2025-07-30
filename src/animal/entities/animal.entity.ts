// src/animal/entities/animal.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Finca } from '../../finca/entities/finca.entity';
import { Potrero } from '../../potrero/entities/potrero.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';
import { ControlSanitario } from '../../control-sanitario/entities/control-sanitario.entity';
import { Reproduccion } from '../../reproduccion/entities/reproduccion.entity';
import { Cria } from '../../cria/entities/cria.entity';
import { EventoAnimal } from '../../evento-animal/entities/evento-animal.entity';

export enum SexoAnimal {
  MACHO = 'Macho',
  HEMBRA = 'Hembra',
}

export enum EstadoAnimal {
  ACTIVO = 'Activo',        // Animal sano en el hato
  ENFERMO = 'Enfermo',      // Animal con alguna enfermedad
  EN_TRATAMIENTO = 'En Tratamiento', // Animal recibiendo medicación o cuidado
  AISLADO = 'Aislado',      // Animal separado del rebaño
  GESTACION = 'Gestación',  // Para hembras preñadas
  VENDIDO = 'Vendido',      // Animal ha sido vendido
  MUERTO = 'Muerto',        // Animal ha fallecido
  DESCARTADO = 'Descartado',// Animal retirado del hato por improductividad u otras razones
}

@Entity('Animales')
export class Animal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'numero_identificador' })
  numero_identificador: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre: string;

  @Column({ type: 'enum', enum: SexoAnimal })
  sexo: SexoAnimal;

  @Column({ type: 'varchar', length: 100, nullable: true })
  raza: string;

  @Column({ type: 'date', name: 'fecha_nacimiento', nullable: true })
  fecha_nacimiento: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  peso_nacimiento: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  peso_actual: number | null;

  @Column({ type: 'date', name: 'fecha_adquisicion', nullable: true })
  fecha_adquisicion: Date | null;

  @Column({ type: 'varchar', length: 50, default: EstadoAnimal.ACTIVO })
  estado: EstadoAnimal;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  // --- Relaciones ---

  @ManyToOne(() => Finca, finca => finca.animales, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'finca_id' })
  finca: Finca;

  @Column({ name: 'finca_id' })
  finca_id: number;

  @ManyToOne(() => Potrero, potrero => potrero.animales, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'potrero_id' })
  potrero: Potrero | null;

  @Column({ name: 'potrero_id', nullable: true })
  potrero_id: number | null;

  @ManyToOne(() => Proveedor, proveedor => proveedor.animales, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor | null;

  @Column({ name: 'proveedor_id', nullable: true })
  proveedor_id: number | null;

  @OneToMany(() => ControlSanitario, control_sanitario => control_sanitario.animal)
  controles_sanitarios: ControlSanitario[];

  @OneToMany(() => Reproduccion, reproduccion => reproduccion.madre)
  reproducciones_madre: Reproduccion[];

  @OneToMany(() => Reproduccion, reproduccion => reproduccion.padre)
  reproducciones_padre: Reproduccion[];

  @OneToOne(() => Cria, cria => cria.cria_animal)
  crias: Cria;

  @OneToMany(() => Cria, cria => cria.madre)
  crias_como_madre: Cria[];

  @OneToMany(() => Cria, cria => cria.padre)
  crias_como_padre: Cria[];

  @OneToMany(() => EventoAnimal, evento_animal => evento_animal.animal)
  eventos_animal: EventoAnimal[];

  // --- Columnas de control de tiempo ---
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleted_at: Date | null;
}