import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: any;

    beforeEach(async () => {
        authService = {
            registerAndLogin: jest.fn(),
            login: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: authService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user, set cookie, and return user object', async () => {
            const mockDto = { email: 'test@test.com', password: '123', nombre: 'Test', telefono: '123' };
            const mockResponse = {
                cookie: jest.fn(),
            } as unknown as Response;

            // Ensure mock user structure conforms to what authService.registerAndLogin returns
            authService.registerAndLogin.mockResolvedValue({
                access_token: 'mockToken123',
                user: { id: 1, email: 'test@test.com', nombre: 'Test', rol: 'USER' }
            });

            const result = await controller.register(mockDto, mockResponse);

            expect(authService.registerAndLogin).toHaveBeenCalledWith(mockDto);
            expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', 'mockToken123', expect.any(Object));
            expect(result).toEqual({ user: { id: 1, email: 'test@test.com', nombre: 'Test', rol: 'USER' } });
        });
    });

    describe('login', () => {
        it('should login, set cookie, and return user object', async () => {
            const mockDto = { email: 'test@test.com', password: '123' };
            const mockResponse = {
                cookie: jest.fn(),
            } as unknown as Response;

            authService.login.mockResolvedValue({
                access_token: 'mockUserToken123',
                user: { id: 2, email: 'test@test.com', nombre: 'Test', rol: 'USER' }
            });

            const result = await controller.login(mockDto, mockResponse);

            expect(authService.login).toHaveBeenCalledWith(mockDto);
            expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', 'mockUserToken123', expect.any(Object));
            expect(result).toEqual({ user: { id: 2, email: 'test@test.com', nombre: 'Test', rol: 'USER' } });
        });
    });

    describe('logout', () => {
        it('should clear access_token cookie', async () => {
            const mockResponse = {
                clearCookie: jest.fn(),
            } as unknown as Response;

            const result = await controller.logout(mockResponse);

            expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token', expect.any(Object));
            expect(result).toEqual({ message: 'Sesión cerrada exitosamente' });
        });
    });

    describe('getProfile', () => {
        it('should return user from req object', () => {
            const mockReq = { user: { id: 3, email: 'profile@example.com' } };

            const result = controller.getProfile(mockReq);

            expect(result).toEqual(mockReq.user);
        });
    });
});
