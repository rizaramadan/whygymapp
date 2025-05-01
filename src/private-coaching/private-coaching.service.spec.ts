import { Test, TestingModule } from '@nestjs/testing';
import { PrivateCoachingService } from './private-coaching.service';
import { MembersService } from '../members/members.service';
import { MemberPricingService } from '../members/member-pricing.service';
import { Pool } from 'pg';

describe('PrivateCoachingService', () => {
  let service: PrivateCoachingService;
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
        PrivateCoachingService,
        MembersService,
        MemberPricingService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<PrivateCoachingService>(PrivateCoachingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more test cases here
});
