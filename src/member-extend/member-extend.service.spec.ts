import { Test, TestingModule } from '@nestjs/testing';
import { MemberExtendService } from './member-extend.service';

describe('MemberExtendService', () => {
  let service: MemberExtendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberExtendService],
    }).compile();

    service = module.get<MemberExtendService>(MemberExtendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
