import { Test, TestingModule } from '@nestjs/testing';
import { PrivateCoachingService } from './private-coaching.service';

describe('PrivateCoachingService', () => {
  let service: PrivateCoachingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrivateCoachingService],
    }).compile();

    service = module.get<PrivateCoachingService>(PrivateCoachingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
