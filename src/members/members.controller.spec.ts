import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MemberPricingService } from './member-pricing.service';
import { Pool } from 'pg';

describe('MembersController', () => {
  let controller: MembersController;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(async () => {
    // Create mock pool
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        MembersService,
        MemberPricingService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more test cases here
});
