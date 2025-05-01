import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';

describe('AuthService', () => {
  let service: AuthService;
  let mockPool: jest.Mocked<Pool>;
  let mockHttpService: jest.Mocked<HttpService>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    // Create mock pool
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    } as any;

    // Create mock HttpService
    mockHttpService = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      axiosRef: {} as any,
    } as any;

    // Create mock JwtService
    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more test cases here
});
