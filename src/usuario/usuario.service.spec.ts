
import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario, RolUsuario } from './entities/usuario.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

// Definimos explícitamente qué métodos vamos a mockear para evitar errores de tipo
// "Object is possibly undefined"
type MockRepository = {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    audit: jest.Mock;
    softDelete: jest.Mock;
    preload: jest.Mock;
    find: jest.Mock;
    createQueryBuilder: jest.Mock;
};

describe('UsuarioService', () => {
    let service: UsuarioService;
    let repository: MockRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsuarioService,
                {
                    provide: getRepositoryToken(Usuario),
                    // Usamos useFactory para crear una instancia nueva para cada test
                    useFactory: () => ({
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        audit: jest.fn(),
                        softDelete: jest.fn(),
                        preload: jest.fn(),
                        find: jest.fn(),
                        createQueryBuilder: jest.fn(() => ({
                            addSelect: jest.fn().mockReturnThis(),
                            where: jest.fn().mockReturnThis(),
                            getOne: jest.fn(),
                        })),
                    }),
                },
            ],
        }).compile();

        service = module.get<UsuarioService>(UsuarioService);
        repository = module.get(getRepositoryToken(Usuario));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('debería crear un usuario nuevo con rol PENDING', async () => {
            const createUsuarioDto = {
                nombre: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            };

            // Mock: No existe usuario previo
            repository.findOne.mockResolvedValue(null);

            const expectedUser = {
                id: 1,
                ...createUsuarioDto,
                rol: RolUsuario.PENDING,
                created_at: new Date(),
                updated_at: new Date(),
            };

            repository.create.mockReturnValue(expectedUser);
            repository.save.mockResolvedValue(expectedUser);

            const result = await service.create(createUsuarioDto);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { email: createUsuarioDto.email } });
            expect(repository.create).toHaveBeenCalledWith({
                ...createUsuarioDto,
                rol: RolUsuario.PENDING,
            });
            expect(result).toEqual(expectedUser);
        });

        it('debería lanzar ConflictException si el email ya existe', async () => {
            const createUsuarioDto = {
                nombre: 'Test User',
                email: 'existing@example.com',
                password: 'password123',
            };

            // Mock: Existe usuario previo
            repository.findOne.mockResolvedValue({ id: 1, email: 'existing@example.com' });

            await expect(service.create(createUsuarioDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findByEmail', () => {
        it('debería retornar un usuario si existe (usando QueryBuilder)', async () => {
            const email = 'test@example.com';
            const expectedUser = { id: 1, email, nombre: 'Test', password: 'hashedpassword' };

            // Mockear la cadena del QueryBuilder
            // Al ser un mock definido explícitamente, TS sabe que devuelve un objeto con mocks
            const queryBuilderMock = {
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(expectedUser),
            };

            repository.createQueryBuilder.mockReturnValue(queryBuilderMock);

            const result = await service.findByEmail(email);

            expect(repository.createQueryBuilder).toHaveBeenCalledWith('usuario');
            expect(queryBuilderMock.addSelect).toHaveBeenCalledWith('usuario.password');
            expect(queryBuilderMock.where).toHaveBeenCalledWith('usuario.email = :email', { email });
            expect(result).toEqual(expectedUser);
        });

        it('debería lanzar NotFoundException si el usuario no existe', async () => {
            const email = 'nonexistent@example.com';

            const queryBuilderMock = {
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            };

            repository.createQueryBuilder.mockReturnValue(queryBuilderMock);

            await expect(service.findByEmail(email)).rejects.toThrow(NotFoundException);
        });
    });
});
