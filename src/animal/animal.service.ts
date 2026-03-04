// src/animal/animal.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, Not, IsNull } from 'typeorm';
import { Animal, SexoAnimal, EstadoSalud, EstadoReproductivo, OrigenAnimal } from './entities/animal.entity';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { Finca } from '../finca/entities/finca.entity';
import { Potrero } from '../potrero/entities/potrero.entity';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { AnimalScheduleService } from './animal-schedule.service';

@Injectable()
export class AnimalService {
  constructor(
    @InjectRepository(Animal)
    private animal_repository: Repository<Animal>,
    @InjectRepository(Finca)
    private finca_repository: Repository<Finca>,
    @InjectRepository(Potrero)
    private potrero_repository: Repository<Potrero>,
    @InjectRepository(Proveedor)
    private proveedor_repository: Repository<Proveedor>,
    private animal_schedule_service: AnimalScheduleService,
  ) { }

  async crear(create_animal_dto: CreateAnimalDto): Promise<Animal> {
    const { finca_id, potrero_id, proveedor_id, ...animal_data } = create_animal_dto;

    // Verificar si el identificador_unico ya existe
    const animal_existente = await this.animal_repository.findOne({
      where: { identificador_unico: animal_data.identificador_unico }
    });

    if (animal_existente) {
      throw new ConflictException(`El animal con identificador único "${animal_data.identificador_unico}" ya está en uso.`);
    }

    const finca = await this.finca_repository.findOne({ where: { id: finca_id } });
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${finca_id} no encontrada.`);
    }

    let potrero: Potrero | null = null;
    if (potrero_id) {
      potrero = await this.potrero_repository.findOne({
        where: { id: potrero_id },
        relations: ['finca'],
      });
      if (!potrero) {
        throw new NotFoundException(`Potrero con ID ${potrero_id} no encontrado.`);
      }
      if (potrero.finca.id !== finca.id) {
        throw new BadRequestException(`El potrero con ID ${potrero_id} no pertenece a la finca con ID ${finca.id}.`);
      }
    }

    let proveedor: Proveedor | null = null;
    if (proveedor_id) {
      proveedor = await this.proveedor_repository.findOne({ where: { id: proveedor_id } });
      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID ${proveedor_id} no encontrado.`);
      }
    }

    const nuevo_animal: Animal = this.animal_repository.create({
      ...animal_data,
      finca,
      potrero,
      proveedor,
      estado_salud: animal_data.estado_salud || EstadoSalud.SANO,
      estado_reproductivo: animal_data.estado_reproductivo,
      origen: animal_data.origen,
    } as DeepPartial<Animal>);

    // Calcular etapa de vida si tiene fecha de nacimiento
    if (nuevo_animal.fecha_nacimiento) {
      nuevo_animal.etapa_vida = this.animal_schedule_service.obtener_etapa_vida(nuevo_animal);
    }

    try {
      return await this.animal_repository.save(nuevo_animal);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          `El identificador único "${animal_data.identificador_unico}" ya está asignado a otro animal`
        );
      }
      throw error;
    }
  }

  async obtener_todos(): Promise<Animal[]> {
    return this.animal_repository.find({
      relations: ['finca', 'potrero', 'proveedor'],
    });
  }

  async obtener_por_id(id: number): Promise<Animal> {
    const animal = await this.animal_repository.findOne({
      where: { id },
      relations: ['finca', 'potrero', 'proveedor'],
    });
    if (!animal) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado.`);
    }
    return animal;
  }

  async actualizar(id: number, update_animal_dto: UpdateAnimalDto): Promise<Animal> {
    const animal = await this.obtener_por_id(id);

    if (update_animal_dto.finca_id !== undefined && update_animal_dto.finca_id !== animal.finca_id) {
      const nueva_finca = await this.finca_repository.findOne({ where: { id: update_animal_dto.finca_id } });
      if (!nueva_finca) throw new NotFoundException(`Finca con ID ${update_animal_dto.finca_id} no encontrada.`);
      animal.finca = nueva_finca;
      animal.finca_id = nueva_finca.id;
    }

    if (update_animal_dto.potrero_id !== undefined) {
      if (update_animal_dto.potrero_id === null) {
        animal.potrero = null;
        animal.potrero_id = null;
      } else if (update_animal_dto.potrero_id !== animal.potrero_id) {
        const nuevo_potrero = await this.potrero_repository.findOne({
          where: { id: update_animal_dto.potrero_id },
          relations: ['finca'],
        });
        if (!nuevo_potrero) throw new NotFoundException(`Potrero con ID ${update_animal_dto.potrero_id} no encontrado.`);
        if (nuevo_potrero.finca.id !== animal.finca.id) {
          throw new BadRequestException(`El potrero con ID ${update_animal_dto.potrero_id} no pertenece a la finca del animal.`);
        }
        animal.potrero = nuevo_potrero;
        animal.potrero_id = nuevo_potrero.id;
      }
    }

    if (update_animal_dto.proveedor_id !== undefined) {
      if (update_animal_dto.proveedor_id === null) {
        animal.proveedor = null;
        animal.proveedor_id = null;
      } else if (update_animal_dto.proveedor_id !== animal.proveedor_id) {
        const nuevo_proveedor = await this.proveedor_repository.findOne({
          where: { id: update_animal_dto.proveedor_id }
        });
        if (!nuevo_proveedor) throw new NotFoundException(`Proveedor con ID ${update_animal_dto.proveedor_id} no encontrado.`);
        animal.proveedor = nuevo_proveedor;
        animal.proveedor_id = nuevo_proveedor.id;
      }
    }

    if (update_animal_dto.sexo) {
      animal.sexo = update_animal_dto.sexo;
    }
    if (update_animal_dto.estado_salud) {
      animal.estado_salud = update_animal_dto.estado_salud;
    }

    const { finca_id: _, potrero_id: __, proveedor_id: ___, ...restOfUpdateDto } = update_animal_dto;
    Object.assign(animal, restOfUpdateDto);

    // Recalcular etapa de vida si cambió la fecha de nacimiento
    if (update_animal_dto.fecha_nacimiento && animal.fecha_nacimiento) {
      animal.etapa_vida = this.animal_schedule_service.obtener_etapa_vida(animal);
    }

    return this.animal_repository.save(animal);
  }

  async eliminar(id: number): Promise<void> {
    const resultado = await this.animal_repository.softDelete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado para eliminar.`);
    }
  }

  async obtener_animales_por_finca(finca_id: number): Promise<Animal[]> {
    const finca = await this.finca_repository.findOne({ where: { id: finca_id } });
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${finca_id} no encontrada.`);
    }
    const animales = await this.animal_repository.find({
      where: { finca: { id: finca_id } },
      relations: ['finca', 'potrero', 'proveedor', 'controles_sanitarios'],
    });

    const dias_limite = 90;
    const hoy = new Date();

    for (const animal of animales) {
      let requiere_atencion = true;
      if (animal.controles_sanitarios && animal.controles_sanitarios.length > 0) {
        const ultima_fecha = animal.controles_sanitarios
          .map(c => new Date(c.fecha))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        const diff = hoy.getTime() - ultima_fecha.getTime();
        const dias_desde = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (dias_desde <= dias_limite) {
          requiere_atencion = false;
        }
      }

      if (animal.requiere_atencion_sanitaria !== requiere_atencion) {
        animal.requiere_atencion_sanitaria = requiere_atencion;
        this.animal_repository.save(animal).catch(() => { });
      }
    }

    return animales;
  }

  async obtener_animales_por_potrero(potrero_id: number): Promise<Animal[]> {
    const potrero = await this.potrero_repository.findOne({ where: { id: potrero_id } });
    if (!potrero) {
      throw new NotFoundException(`Potrero con ID ${potrero_id} no encontrado.`);
    }
    return this.animal_repository.find({
      where: { potrero: { id: potrero_id } },
      relations: ['finca', 'proveedor'],
    });
  }

  // Nuevos métodos para reportes y alertas

  async obtener_animales_con_alertas_sanitarias(finca_id?: number): Promise<Animal[]> {
    const where: any = {
      eliminado_en: IsNull()
    };

    if (finca_id) {
      where.finca = { id: finca_id };
    }

    const animales = await this.animal_repository.find({
      where,
      relations: ['finca', 'potrero', 'controles_sanitarios'],
    });

    const dias_limite = 90;
    const hoy = new Date();
    const animales_con_alertas: Animal[] = [];

    for (const animal of animales) {
      let requiere_atencion = true;
      if (animal.controles_sanitarios && animal.controles_sanitarios.length > 0) {
        const ultima_fecha = animal.controles_sanitarios
          .map(c => new Date(c.fecha))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        const diff = hoy.getTime() - ultima_fecha.getTime();
        const dias_desde = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (dias_desde <= dias_limite) {
          requiere_atencion = false;
        }
      }

      if (requiere_atencion) {
        animales_con_alertas.push(animal);
      }

      // Sincronizar con DB temporalmente sin bloquear
      if (animal.requiere_atencion_sanitaria !== requiere_atencion) {
        animal.requiere_atencion_sanitaria = requiere_atencion;
        this.animal_repository.save(animal).catch(() => { });
      }
    }

    return animales_con_alertas;
  }

  async obtener_animales_proximos_a_parir(dias_antes: number = 30, finca_id?: number): Promise<Animal[]> {
    const fecha_limite = new Date();
    fecha_limite.setDate(fecha_limite.getDate() + dias_antes);

    const where: any = {
      fecha_probable_parto: Not(IsNull()),
      eliminado_en: IsNull()
    };

    if (finca_id) {
      where.finca = { id: finca_id };
    }

    const animales = await this.animal_repository.find({
      where,
      relations: ['finca', 'potrero'],
    });

    return animales.filter(animal =>
      animal.fecha_probable_parto &&
      animal.fecha_probable_parto <= fecha_limite &&
      animal.fecha_probable_parto >= new Date()
    );
  }

  async obtener_estadisticas_etapas_vida(finca_id?: number): Promise<any> {
    const where: any = {
      eliminado_en: IsNull()
    };

    if (finca_id) {
      where.finca = { id: finca_id };
    }

    const animales = await this.animal_repository.find({ where });

    const estadisticas = {
      terneros: 0,
      terneras: 0,
      novillos: 0,
      novillas: 0,
      adultos: 0,
      adultas: 0,
      adultos_mayores: 0,
      sin_etapa: 0,
      total: animales.length
    };

    animales.forEach(animal => {
      switch (animal.etapa_vida) {
        case 'ternero': estadisticas.terneros++; break;
        case 'ternera': estadisticas.terneras++; break;
        case 'novillo': estadisticas.novillos++; break;
        case 'novilla': estadisticas.novillas++; break;
        case 'adulto': estadisticas.adultos++; break;
        case 'adulta': estadisticas.adultas++; break;
        case 'adulto_mayor': estadisticas.adultos_mayores++; break;
        default: estadisticas.sin_etapa++;
      }
    });

    return estadisticas;
  }
}