import { Test, TestingModule } from '@nestjs/testing';
import { MemberExtendController } from './member-extend.controller';

describe('MemberExtendController', () => {
  let controller: MemberExtendController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberExtendController],
    }).compile();

    controller = module.get<MemberExtendController>(MemberExtendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
