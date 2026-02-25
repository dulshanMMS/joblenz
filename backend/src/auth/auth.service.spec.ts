import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/schemas/user.schema';

// Mock the User model methods we use
const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getModelToken(User.name), useValue: mockUserModel },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);

        // Reset mocks before each test
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user and return a token', async () => {
            mockUserModel.findOne.mockResolvedValue(null); // no existing user
            mockUserModel.create.mockResolvedValue({
                _id: 'user-id-123',
                name: 'John',
                email: 'john@example.com',
                password: 'hashed-password',
            });

            const result = await service.register({
                name: 'John',
                email: 'john@example.com',
                password: 'password123',
            });

            expect(result.accessToken).toBe('mock-jwt-token');
            expect(result.user.email).toBe('john@example.com');
        });

        it('should throw ConflictException if email already exists', async () => {
            mockUserModel.findOne.mockResolvedValue({ email: 'john@example.com' });

            await expect(
                service.register({
                    name: 'John',
                    email: 'john@example.com',
                    password: 'password123',
                }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('should login and return a token with valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            mockUserModel.findOne.mockResolvedValue({
                _id: 'user-id-123',
                name: 'John',
                email: 'john@example.com',
                password: hashedPassword,
            });

            const result = await service.login({
                email: 'john@example.com',
                password: 'password123',
            });

            expect(result.accessToken).toBe('mock-jwt-token');
        });

        it('should throw UnauthorizedException if user is not found', async () => {
            mockUserModel.findOne.mockResolvedValue(null);

            await expect(
                service.login({ email: 'nobody@example.com', password: 'pass' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password is incorrect', async () => {
            const hashedPassword = await bcrypt.hash('correctpassword', 10);
            mockUserModel.findOne.mockResolvedValue({
                _id: 'user-id-123',
                email: 'john@example.com',
                password: hashedPassword,
            });

            await expect(
                service.login({ email: 'john@example.com', password: 'wrongpassword' }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
