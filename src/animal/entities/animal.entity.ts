// src/animal/entities/animal.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Finca } from '../../finca/entities/finca.entity';
import { Potrero } from '../../potrero/entities/potrero.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';
import { ControlSanitario } from '../../control-sanitario/entities/control-sanitario.entity';
import { Reproduccion } from '../../reproduccion/entities/reproduccion.entity';
import { Cria } from '../../cria/entities/cria.entity';
import { EventoAnimal } from '../../evento-animal/entities/evento-animal.entity';
import { ProduccionLeche } from '../../produccion-leche/entities/produccion-leche.entity';

export enum SexoAnimal {
  MACHO = 'macho',
  HEMBRA = 'hembra',
}

export enum EstadoReproductivo {
  VACIA = 'vacia',
  PRENADA = 'prenada',
  LACTANDO = 'lactando',
  EN_ENGORDE = 'en_engorde',
  EN_PRODUCCION_LECHERA = 'en_produccion_lechera',
  LISTO_PARA_VENTA_O_SACRIFICIO = 'listo_para_venta_o_sacrificio',
}

export enum EstadoSalud {
  SANO = 'sano',
  DIAGNOSTICADO_ENFERMO = 'diagnosticado_enfermo',
  EN_TRATAMIENTO = 'en_tratamiento',
}

export enum OrigenAnimal {
  NACIDO_EN_FINCA = 'nacido_en_finca',
  COMPRADO = 'comprado',
}

export enum EtapaVida {
  TERNERO = 'ternero',
  TERNERA = 'ternera',
  NOVILLO = 'novillo',
  NOVILLA = 'novilla',
  ADULTO = 'adulto',
  ADULTA = 'adulta',
  ADULTO_MAYOR = 'adulto_mayor',
}

@Entity('animales')
export class Animal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  identificador_unico: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  raza: string;

  @Column({ type: 'enum', enum: SexoAnimal })
  sexo: SexoAnimal;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  peso_kg: number | null;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date | null;

  @Column({ type: 'enum', enum: EtapaVida, nullable: true })
  etapa_vida: EtapaVida | null;

  @Column({ type: 'enum', enum: EstadoReproductivo, nullable: true, comment: 'Estado reproductivo o productivo del animal' })
  estado_reproductivo: EstadoReproductivo | null;

  @Column({ type: 'enum', enum: EstadoSalud, default: EstadoSalud.SANO })
  estado_salud: EstadoSalud;

  @Column({ type: 'enum', enum: OrigenAnimal, nullable: true })
  origen: OrigenAnimal | null;

  // Solo para animales COMPRADO

  @Column({ type: 'date', nullable: true })
  fecha_adquisicion: Date | null;

  // Campos calculados para alertas/schedules

  @Column({ type: 'date', nullable: true, comment: 'Fecha probable de parto calculada' })
  fecha_probable_parto: Date | null;

  @Column({ type: 'date', nullable: true, comment: 'Última fecha de control sanitario' })
  ultima_fecha_control_sanitario: Date | null;

  @Column({ type: 'boolean', default: false, comment: 'Si requiere atención sanitaria urgente' })
  requiere_atencion_sanitaria: boolean;

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

  @OneToMany(() => ProduccionLeche, produccion => produccion.animal)
  producciones_leche: ProduccionLeche[];

  // --- Timestamps ---
  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;

  @DeleteDateColumn()
  eliminado_en: Date | null;
}