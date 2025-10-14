// src/animal/animal.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Animal, SexoAnimal, EstadoSalud, EstadoReproductivo, OrigenAnimal } from './entities/animal.entity';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { Finca } from '../finca/entities/finca.entity';
import { Potrero } from '../potrero/entities/potrero.entity';
import { Proveedor } from '../proveedor/entities/proveedor.entity';

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
  ) {}

  async crear(create_animal_dto: CreateAnimalDto): Promise<Animal> {
    const { finca_id, potrero_id, proveedor_id, ...animal_data } = create_animal_dto;

    // Verificar si el identificador_unico ya existe
    const animal_existente = await this.animal_repository.findOne({ where: { identificador_unico: animal_data.identificador_unico } });

    if (animal_existente) {
      throw new ConflictException(`El animal con identificador único "${animal_data.identificador_unico}" ya está en uso.`);
    }

    const finca = await this.finca_repository.findOne({ where: { id: finca_id } });
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${finca_id} no encontrada.`);
    }

    let potrero: Potrero | null = null;
    if (potrero_id) {
      // 🐄 ⬅️ CORRECCIÓN CLAVE: Cargar la relación 'finca' del Potrero
      potrero = await this.potrero_repository.findOne({
        where: { id: potrero_id },
        relations: ['finca'], // ¡Asegura que la relación 'finca' se cargue!
      });
      if (!potrero) {
        throw new NotFoundException(`Potrero con ID ${potrero_id} no encontrado.`);
      }
      // Ahora potrero.finca debería estar definido si el potrero existe
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
      // finca_id, // Si tu entidad Animal tiene una columna `finca_id` y una relación `finca` (ManyToOne), TypeORM manejará el ID automáticamente si le pasas el objeto `finca`. Puedes omitir `finca_id` aquí.
      potrero,
      // potrero_id, // Similar a finca_id, TypeORM puede manejarlo.
      proveedor,
      // proveedor_id, // Similar a finca_id, TypeORM puede manejarlo.
      estado_salud: animal_data.estado_salud || EstadoSalud.SANO,
      estado_reproductivo: animal_data.estado_reproductivo,
      origen: animal_data.origen,
    } as DeepPartial<Animal>);

    try{
      return await this.animal_repository.save(nuevo_animal);
    }catch(error){
      // Capturar error de duplicado de MySQL
      if(error.code === 'ER_DUP_ENTRY'){
        throw new ConflictException(
          `El identificador único "${animal_data.identificador_unico}" ya está asignado a otro animal`
        );
      }
      throw error
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

    // Actualizar relaciones si los IDs cambian
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
        // 🐄 ⬅️ CORRECCIÓN CLAVE: Cargar la relación 'finca' del Potrero al actualizar
        const nuevo_potrero = await this.potrero_repository.findOne({
          where: { id: update_animal_dto.potrero_id },
          relations: ['finca'], // ¡Asegura que la relación 'finca' se cargue!
        });
        if (!nuevo_potrero) throw new NotFoundException(`Potrero con ID ${update_animal_dto.potrero_id} no encontrado.`);
        // Ahora nuevo_potrero.finca debería estar definido
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
        const nuevo_proveedor = await this.proveedor_repository.findOne({ where: { id: update_animal_dto.proveedor_id } });
        if (!nuevo_proveedor) throw new NotFoundException(`Proveedor con ID ${update_animal_dto.proveedor_id} no encontrado.`);
        animal.proveedor = nuevo_proveedor;
        animal.proveedor_id = nuevo_proveedor.id;
      }
    }


    // Asegurarse de que `sexo` y `estado_salud` se asignen correctamente
    if (update_animal_dto.sexo) {
      animal.sexo = update_animal_dto.sexo;
    }
    if (update_animal_dto.estado_salud) {
      animal.estado_salud = update_animal_dto.estado_salud;
    }

    // Asignar el resto de las propiedades que no son relaciones ID
    const { finca_id: _, potrero_id: __, proveedor_id: ___, ...restOfUpdateDto } = update_animal_dto;
    Object.assign(animal, restOfUpdateDto);


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
    return this.animal_repository.find({
        where: { finca: { id: finca_id } },
        relations: ['finca','potrero', 'proveedor'],
    });
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
}
