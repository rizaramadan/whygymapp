import { Test, TestingModule } from '@nestjs/testing';
import { FoService } from './fo.service';
import { Pool } from 'pg';

describe('FoService', () => {
  let service: FoService;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(async () => {
    // Create mock pool
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<FoService>(FoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPendingExtensionOrders', () => {
    it('should return pending extension orders', async () => {
      const mockOrders = [
        {
          memberEmail: 'test@example.com',
          paymentStatus: 'PENDING',
          paymentUrl: 'https://payment.example.com',
          createdAt: new Date('2025-01-01'),
        },
      ];

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [
          ['test@example.com', 'PENDING', 'https://payment.example.com', new Date('2025-01-01')],
        ],
        rowCount: 1,
        command: 'SELECT',
        oid: null,
        fields: [],
      });

      const result = await service.getPendingExtensionOrders();

      expect(result).toEqual(mockOrders);
      expect(mockPool.query).toHaveBeenCalledWith({
        text: expect.stringContaining('getPendingExtensionOrders'),
        values: [],
        rowMode: 'array',
      });
    });

    it('should return empty array when no pending orders', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: null,
        fields: [],
      });

      const result = await service.getPendingExtensionOrders();

      expect(result).toEqual([]);
    });
  });
});
