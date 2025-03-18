import { Test, TestingModule } from '@nestjs/testing';
import { FoService } from './fo.service';

describe('FoService', () => {
  let service: FoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoService],
    }).compile();

    service = module.get<FoService>(FoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
