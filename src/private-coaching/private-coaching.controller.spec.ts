import { Test, TestingModule } from '@nestjs/testing';
import { PrivateCoachingController } from './private-coaching.controller';

describe('PrivateCoachingController', () => {
  let controller: PrivateCoachingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrivateCoachingController],
    }).compile();

    controller = module.get<PrivateCoachingController>(PrivateCoachingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
