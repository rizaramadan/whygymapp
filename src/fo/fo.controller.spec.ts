import { Test, TestingModule } from '@nestjs/testing';
import { FoController } from './fo.controller';

describe('FoController', () => {
  let controller: FoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoController],
    }).compile();

    controller = module.get<FoController>(FoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
