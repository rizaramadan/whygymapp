import { Test, TestingModule } from '@nestjs/testing';
import { FoController } from './fo.controller';
import { FoService } from './fo.service';
import { MembersService } from '../members/members.service';
import { MemberPricingService } from '../members/member-pricing.service';
import { Pool } from 'pg';

describe('FoController', () => {
  let controller: FoController;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(async () => {
    // Create mock pool
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoController],
      providers: [
        FoService,
        MembersService,
        MemberPricingService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    controller = module.get<FoController>(FoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more test cases here
});
