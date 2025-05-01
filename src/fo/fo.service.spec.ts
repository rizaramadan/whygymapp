import { Test, TestingModule } from '@nestjs/testing';
import { FoService } from './fo.service';
import { Pool } from 'pg';

describe('FoService', () => {
  let service: FoService;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(async () => {
    // Create mock pool
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<FoService>(FoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more test cases here
});
