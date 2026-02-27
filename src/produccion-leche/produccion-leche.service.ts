import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProduccionLecheDto } from './dto/create-produccion-leche.dto';
import { UpdateProduccionLecheDto } from './dto/update-produccion-leche.dto';
import { ProduccionLeche } from './entities/produccion-leche.entity';
import { Animal } from '../animal/entities/animal.entity';
import { Finca } from '../finca/entities/finca.entity';

@Injectable()
export class ProduccionLecheService {
    constructor(
        @InjectRepository(ProduccionLeche)
        private readonly produccionLecheRepository: Repository<ProduccionLeche>,
        @InjectRepository(Animal)
        private readonly animalRepository: Repository<Animal>,
        @InjectRepository(Finca)
        private readonly fincaRepository: Repository<Finca>,
    ) { }

    async create(createProduccionLecheDto: CreateProduccionLecheDto): Promise<ProduccionLeche> {
        const { animal_id, finca_id, ...data } = createProduccionLecheDto;

        const animal = await this.animalRepository.findOne({ where: { id: animal_id } });
        if (!animal) {
            throw new NotFoundException(`Animal con ID ${animal_id} no encontrado`);
        }

        const finca = await this.fincaRepository.findOne({ where: { id: finca_id } });
        if (!finca) {
            throw new NotFoundException(`Finca con ID ${finca_id} no encontrada`);
        }

        // Optional: Validate animal belongs to finca if strictly enforced
        // if (animal.finca_id !== finca.id) ... 

        this.validateProduccion(data);

        const nuevaProduccion = this.produccionLecheRepository.create({
            ...data,
            animal,
            finca,
        });

        return await this.produccionLecheRepository.save(nuevaProduccion);
    }

    async findAll(fincaId?: number, animalId?: number, fechaInicio?: string, fechaFin?: string): Promise<ProduccionLeche[]> {
        const query = this.produccionLecheRepository.createQueryBuilder('produccion')
            .leftJoinAndSelect('produccion.animal', 'animal')
            .leftJoinAndSelect('produccion.finca', 'finca')
            .orderBy('produccion.fecha', 'DESC');

        if (fincaId) {
            query.andWhere('finca.id = :fincaId', { fincaId });
        }

        if (animalId) {
            query.andWhere('animal.id = :animalId', { animalId });
        }

        if (fechaInicio) {
            query.andWhere('produccion.fecha >= :fechaInicio', { fechaInicio });
        }

        if (fechaFin) {
            query.andWhere('produccion.fecha <= :fechaFin', { fechaFin });
        }

        return await query.getMany();
    }

    async findOne(id: number): Promise<ProduccionLeche> {
        const produccion = await this.produccionLecheRepository.findOne({
            where: { id },
            relations: ['animal', 'finca'],
        });

        if (!produccion) {
            throw new NotFoundException(`Producción de leche con ID ${id} no encontrada`);
        }

        return produccion;
    }

    async update(id: number, updateProduccionLecheDto: UpdateProduccionLecheDto): Promise<ProduccionLeche> {
        const produccion = await this.findOne(id);
        const { animal_id, finca_id, ...data } = updateProduccionLecheDto;

        if (animal_id) {
            const animal = await this.animalRepository.findOne({ where: { id: animal_id } });
            if (!animal) throw new NotFoundException(`Animal con ID ${animal_id} no encontrado`);
            produccion.animal = animal;
        }

        if (finca_id) {
            const finca = await this.fincaRepository.findOne({ where: { id: finca_id } });
            if (!finca) throw new NotFoundException(`Finca con ID ${finca_id} no encontrada`);
            produccion.finca = finca;
        }

        Object.assign(produccion, data);
        this.validateProduccion(produccion);

        return await this.produccionLecheRepository.save(produccion);
    }

    async remove(id: number): Promise<void> {
        const result = await this.produccionLecheRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Producción de leche con ID ${id} no encontrada`);
        }
    }

    // Analytics methods (optional but useful)
    async getDailyProduction(fincaId: number, date: string): Promise<number> {
        const result = await this.produccionLecheRepository
            .createQueryBuilder('produccion')
            .select('SUM(produccion.cantidad)', 'total')
            .where('produccion.finca_id = :fincaId', { fincaId })
            .andWhere('produccion.fecha = :date', { date })
            .getRawOne();

        return parseFloat(result.total) || 0;
    }

    private validateProduccion(data: { fecha?: string | Date; cantidad?: number; }) {
        if (data.cantidad !== undefined && data.cantidad !== null) {
            const cantidadNum = typeof data.cantidad === 'string' ? parseFloat(data.cantidad) : data.cantidad;
            if (cantidadNum <= 0) {
                throw new BadRequestException('La cantidad de leche debe ser mayor que 0.');
            }
            if (cantidadNum > 100) {
                throw new BadRequestException('La cantidad de leche registrada es inusualmente alta (> 100 litros). Verifique el valor.');
            }
        }
        if (data.fecha) {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // Consider today valid even if later in the day
            const inputDate = new Date(data.fecha);
            inputDate.setHours(0, 0, 0, 0);

            if (inputDate > currentDate) {
                throw new BadRequestException('La fecha de producción no puede estar en el futuro.');
            }
        }
    }
}
