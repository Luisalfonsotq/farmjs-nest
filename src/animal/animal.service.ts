// src/animal/animal.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm'; // Import DeepPartial
import { Animal, SexoAnimal, EstadoAnimal } from './entities/animal.entity';
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

    // Verificar si el numero_identificador ya existe
    const animal_existente = await this.animal_repository.findOne({ where: { numero_identificador: animal_data.numero_identificador } });
    if (animal_existente) {
      throw new ConflictException(`El animal con número identificador "${animal_data.numero_identificador}" ya existe.`);
    }

    const finca = await this.finca_repository.findOne({ where: { id: finca_id } });
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${finca_id} no encontrada.`);
    }

    let potrero: Potrero | null = null;
    if (potrero_id) { // potrero_id could be null, so check for truthiness
      potrero = await this.potrero_repository.findOne({ where: { id: potrero_id } });
      if (!potrero) {
        throw new NotFoundException(`Potrero con ID ${potrero_id} no encontrado.`);
      }
      if (potrero.finca.id !== finca.id) {
        throw new BadRequestException(`El potrero con ID ${potrero_id} no pertenece a la finca con ID ${finca_id}.`);
      }
    }

    let proveedor: Proveedor | null = null;
    if (proveedor_id) { // proveedor_id could be null, so check for truthiness
      proveedor = await this.proveedor_repository.findOne({ where: { id: proveedor_id } });
      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID ${proveedor_id} no encontrado.`);
      }
    }

    // 🐄 ⬅️ CORRECCIÓN CLAVE: Asegúrate de que el objeto que pasas a .create()
    // coincida con la definición de la entidad.
    // proveedor_id y potrero_id ya son `number | null` del DTO,
    // y las instancias `proveedor` y `potrero` son `Proveedor | null` o `Potrero | null`.
    const nuevo_animal: Animal = this.animal_repository.create({
      ...animal_data,
      finca,
      finca_id,
      potrero,
      potrero_id,
      proveedor,
      proveedor_id,
      estado: animal_data.estado || EstadoAnimal.ACTIVO,
    } as DeepPartial<Animal>); // 🪄 Añade una aserción de tipo si los errores persisten,
                              // aunque con los DTOs y entidades correctos, no debería ser necesaria.

    // 🐄 ⬅️ CORRECCIÓN CLAVE: La inferencia del tipo de retorno de .save()
    // Asegura que se retorne una sola entidad Animal, no un array.
    return await this.animal_repository.save(nuevo_animal); // Añade `await` para consistencia
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


    if (update_animal_dto.potrero_id !== undefined) { // Check if it's explicitly provided, even if null
      if (update_animal_dto.potrero_id === null) {
        animal.potrero = null;
        animal.potrero_id = null;
      } else if (update_animal_dto.potrero_id !== animal.potrero_id) { // Only update if ID changes
        const nuevo_potrero = await this.potrero_repository.findOne({ where: { id: update_animal_dto.potrero_id } });
        if (!nuevo_potrero) throw new NotFoundException(`Potrero con ID ${update_animal_dto.potrero_id} no encontrado.`);
        if (nuevo_potrero.finca.id !== animal.finca.id) {
          throw new BadRequestException(`El potrero con ID ${update_animal_dto.potrero_id} no pertenece a la finca del animal.`);
        }
        animal.potrero = nuevo_potrero;
        animal.potrero_id = nuevo_potrero.id;
      }
    }


    // 🐂 ⬅️ CORRECCIÓN CLAVE: Revisar la lógica de asignación para `proveedor_id`
    if (update_animal_dto.proveedor_id !== undefined) { // Check if it's explicitly provided, even if null
      if (update_animal_dto.proveedor_id === null) {
        animal.proveedor = null;
        animal.proveedor_id = null; // 🚀 ESTA LÍNEA ES LA QUE PROBABLEMENTE CAUSA EL ERROR 2322
                                    // DEBIDO A LA INFERENCIA DE TIPO EN ALGUN CONTEXTO.
                                    // Si la entidad y el DTO son `number | null`, debería funcionar.
                                    // Si no, la aserción de tipo podría ayudar, pero es mejor corregir la fuente.
      } else if (update_animal_dto.proveedor_id !== animal.proveedor_id) { // Only update if ID changes
        const nuevo_proveedor = await this.proveedor_repository.findOne({ where: { id: update_animal_dto.proveedor_id } });
        if (!nuevo_proveedor) throw new NotFoundException(`Proveedor con ID ${update_animal_dto.proveedor_id} no encontrado.`);
        animal.proveedor = nuevo_proveedor;
        animal.proveedor_id = nuevo_proveedor.id;
      }
    }


    // Asegurarse de que `sexo` y `estado` se asignen correctamente
    if (update_animal_dto.sexo) {
      animal.sexo = update_animal_dto.sexo;
    }
    if (update_animal_dto.estado) {
      animal.estado = update_animal_dto.estado;
    }

    // Asignar el resto de las propiedades que no son relaciones ID
    // Omitir los IDs de las relaciones ya que las manejamos manualmente
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

  // Add these to src/animal/animal.service.ts
// ... inside your AnimalService class ...

async obtener_animales_por_finca(finca_id: number): Promise<Animal[]> {
    const finca = await this.finca_repository.findOne({ where: { id: finca_id } });
    if (!finca) {
        throw new NotFoundException(`Finca con ID ${finca_id} no encontrada.`);
    }
    return this.animal_repository.find({
        where: { finca: { id: finca_id } },
        relations: ['potrero', 'proveedor'], // Puedes cargar otras relaciones si es necesario
    });
}

async obtener_animales_por_potrero(potrero_id: number): Promise<Animal[]> {
    const potrero = await this.potrero_repository.findOne({ where: { id: potrero_id } });
    if (!potrero) {
        throw new NotFoundException(`Potrero con ID ${potrero_id} no encontrado.`);
    }
    return this.animal_repository.find({
        where: { potrero: { id: potrero_id } },
        relations: ['finca', 'proveedor'], // Puedes cargar otras relaciones si es necesario
    });
}
}