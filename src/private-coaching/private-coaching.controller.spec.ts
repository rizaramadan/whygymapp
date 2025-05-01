import { Test, TestingModule } from '@nestjs/testing';
import { PrivateCoachingController } from './private-coaching.controller';
import { PrivateCoachingService } from './private-coaching.service';
import { MembersService } from '../members/members.service';
import { MemberPricingService } from '../members/member-pricing.service';
import { Pool } from 'pg';

describe('PrivateCoachingController', () => {
  let controller: PrivateCoachingController;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(async () => {
    // Create mock pool
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrivateCoachingController],
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

    controller = module.get<PrivateCoachingController>(PrivateCoachingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more test cases here
});
