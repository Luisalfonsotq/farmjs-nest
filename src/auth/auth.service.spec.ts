import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let usuarioService: any;
    let jwtService: any;

    beforeEach(async () => {
        usuarioService = {
            findByEmail: jest.fn(),
            create: jest.fn(),
        };

        jwtService = {
            signAsync: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsuarioService, useValue: usuarioService },
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('should throw UnauthorizedException if user not found', async () => {
            usuarioService.findByEmail.mockResolvedValue(null);

            await expect(service.login({ email: 'test@example.com', password: 'password' }))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password does not match', async () => {
            usuarioService.findByEmail.mockResolvedValue({
                id: 1, email: 'test@example.com', password: 'hashedpassword'
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login({ email: 'test@example.com', password: 'wrongpassword' }))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should return a token and user data on successful login', async () => {
            const mockUser = {
                id: 1, email: 'test@example.com', nombre: 'Test', password: 'hashedpassword', rol: 'ADMIN'
            };
            usuarioService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            jwtService.signAsync.mockResolvedValue('mockToken');

            const result = await service.login({ email: 'test@example.com', password: 'password' });

            expect(result).toEqual({
                access_token: 'mockToken',
                user: { id: 1, nombre: 'Test', email: 'test@example.com', rol: 'ADMIN' },
            });
        });
    });

    describe('validateUser', () => {
        it('should throw UnauthorizedException if user not found', async () => {
            usuarioService.findByEmail.mockResolvedValue(null);

            await expect(service.validateUser({ sub: 'missing@example.com' }))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should return user without password on success', async () => {
            usuarioService.findByEmail.mockResolvedValue({
                id: 1, email: 'test@example.com', password: 'secret', nombre: 'Test'
            });

            const result = await service.validateUser({ sub: 'test@example.com' });

            expect(result).toEqual({
                id: 1, email: 'test@example.com', nombre: 'Test'
            });
            expect(result).not.toHaveProperty('password');
        });
    });

    describe('registerAndLogin', () => {
        it('should register and return login data', async () => {
            const createDto = { email: 'new@example.com', password: 'password123', nombre: 'New', telefono: '123' };
            const newUser = { id: 2, ...createDto, rol: 'USER', password: 'hashedpassword' };

            usuarioService.create.mockResolvedValue(newUser);

            // We also mock what `login` would do under the hood:
            usuarioService.findByEmail.mockResolvedValue(newUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            jwtService.signAsync.mockResolvedValue('newToken');

            const result = await service.registerAndLogin(createDto);

            expect(usuarioService.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual({
                access_token: 'newToken',
                user: { id: 2, nombre: 'New', email: 'new@example.com', rol: 'USER' },
            });
        });

        it('should throw BadRequestException if conflict error on create', async () => {
            const createDto = { email: 'exist@example.com', password: '123', nombre: 'X', telefono: '123' };

            usuarioService.create.mockRejectedValue(new ConflictException());

            await expect(service.registerAndLogin(createDto)).rejects.toThrow(BadRequestException);
            await expect(service.registerAndLogin(createDto)).rejects.toThrow('El email ya está registrado.');
        });

        it('should rethrow non-conflict errors from create', async () => {
            const createDto = { email: 'bad@example.com', password: '123', nombre: 'X', telefono: '123' };

            usuarioService.create.mockRejectedValue(new Error('Unexpected Db error'));

            await expect(service.registerAndLogin(createDto)).rejects.toThrow('Unexpected Db error');
        });
    });
});
