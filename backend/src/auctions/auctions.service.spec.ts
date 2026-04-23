import { Test, TestingModule } from '@nestjs/testing';
import { AuctionsService } from './auctions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { DataSource } from 'typeorm';

describe('AuctionsService', () => {
  let service: AuctionsService;
  let mockAuctionRepo: any;
  let mockBidRepo: any;

  beforeEach(async () => {
    mockAuctionRepo = {
      create: jest.fn((dto) => ({ id: 'test-id', ...dto })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'test-id' })),
      find: jest.fn(() => Promise.resolve([])),
      findOne: jest.fn(),
      count: jest.fn(() => Promise.resolve(0)),
    };

    mockBidRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'bid-id', ...entity })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionsService,
        { provide: getRepositoryToken(Auction), useValue: mockAuctionRepo },
        { provide: getRepositoryToken(Bid), useValue: mockBidRepo },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<AuctionsService>(AuctionsService);
  });

  describe('create', () => {
    it('should create auction with computed endTime', async () => {
      const before = Date.now();
      const result = await service.create({
        name: 'Test',
        description: 'Desc',
        startingPriceCents: 1000,
        durationSeconds: 300,
      });

      expect(mockAuctionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test',
          startingPriceCents: 1000,
          durationSeconds: 300,
          status: 'active',
          currentHighestBidCents: 0,
        }),
      );

      const endTime = mockAuctionRepo.create.mock.calls[0][0].endTime.getTime();
      expect(endTime).toBeGreaterThanOrEqual(before + 300000);
      expect(endTime).toBeLessThanOrEqual(Date.now() + 300000);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for nonexistent auction', async () => {
      mockAuctionRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Auction not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockAuctionRepo.createQueryBuilder = jest.fn().mockReturnValue(mockQb);

      const result = await service.findAll({ page: 1, limit: 12 });
      expect(result).toEqual({ data: [], total: 0, page: 1, totalPages: 0 });
      expect(mockQb.orderBy).toHaveBeenCalledWith('auction.createdAt', 'DESC');
    });
  });
});
