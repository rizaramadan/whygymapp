import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { HttpException } from '@nestjs/common';

describe('MembersController', () => {
  let controller: MembersController;
  let service: MembersService;

  const mockMembersService = {
    getMemberDurationData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: mockMembersService,
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMemberExpireDate', () => {
    it('should return duration in HTML format for valid member ID', async () => {
      // Arrange
      const memberId = '123';
      const expectedDuration = 90;
      mockMembersService.getMemberDurationData.mockResolvedValue(expectedDuration);

      // Act
      const result = await controller.getMemberExpireDate(memberId);

      // Assert
      expect(result).toBe(`<ul><li>${expectedDuration}</li></ul>`);
      expect(mockMembersService.getMemberDurationData).toHaveBeenCalledWith(123);
    });

    it('should throw HttpException for invalid member ID', async () => {
      // Arrange
      const invalidId = 'abc';

      // Act & Assert
      await expect(controller.getMemberExpireDate(invalidId)).rejects.toThrow(HttpException);
    });

    it('should throw HttpException when member is not found', async () => {
      // Arrange
      const memberId = '123';
      mockMembersService.getMemberDurationData.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getMemberExpireDate(memberId)).rejects.toThrow(HttpException);
      expect(mockMembersService.getMemberDurationData).toHaveBeenCalledWith(123);
    });
  });

  // Add more test cases here
});
