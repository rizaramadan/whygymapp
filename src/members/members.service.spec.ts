import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { MemberPricingService } from './member-pricing.service';
import { Pool } from 'pg';

describe('MembersService', () => {
  let service: MembersService;
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
        MembersService,
        MemberPricingService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more test cases here
});
