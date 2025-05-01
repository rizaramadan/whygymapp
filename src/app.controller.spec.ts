import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembersService } from './members/members.service';
import { UsersService } from './users/users.service';
import { MemberPricingService } from './members/member-pricing.service';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';

describe('AppController', () => {
  let appController: AppController;
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
      controllers: [AppController],
      providers: [
        AppService,
        MembersService,
        UsersService,
        MemberPricingService,
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

    appController = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('root', () => {
    it('should return login redirect script', () => {
      expect(appController.getHello()).toBe('<script>window.location.href="/auth/login"</script>');
    });
  });

  // Add more test cases here
});
