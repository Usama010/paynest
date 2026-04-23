import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepo: Repository<Auction>,
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateAuctionDto): Promise<Auction> {
    const auction = this.auctionRepo.create({
      name: dto.name,
      description: dto.description,
      startingPriceCents: dto.startingPriceCents,
      currentHighestBidCents: 0,
      durationSeconds: dto.durationSeconds,
      endTime: new Date(Date.now() + dto.durationSeconds * 1000),
      status: 'active',
    });
    return this.auctionRepo.save(auction);
  }

  async findAll(): Promise<Auction[]> {
    return this.auctionRepo.find({
      relations: ['highestBidder'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Auction> {
    const auction = await this.auctionRepo.findOne({
      where: { id },
      relations: ['highestBidder', 'bids', 'bids.user'],
      order: { bids: { createdAt: 'DESC' } },
    });
    if (!auction) throw new NotFoundException('Auction not found');
    return auction;
  }

  async placeBid(
    auctionId: string,
    dto: PlaceBidDto,
  ): Promise<{ bid: Bid; auction: Auction }> {
    return this.dataSource.transaction(async (manager) => {
      const auction = await manager
        .createQueryBuilder(Auction, 'a')
        .setLock('pessimistic_write')
        .where('a.id = :id', { id: auctionId })
        .getOne();

      if (!auction) throw new NotFoundException('Auction not found');

      if (auction.status === 'closed' || new Date() >= auction.endTime) {
        throw new BadRequestException('Auction has ended');
      }

      if (auction.highestBidderId === dto.userId) {
        throw new BadRequestException('You are already the highest bidder');
      }

      const minimumBid =
        auction.currentHighestBidCents > 0
          ? auction.currentHighestBidCents + 100
          : auction.startingPriceCents;

      if (dto.amountCents < minimumBid) {
        throw new BadRequestException(
          `Bid must be at least ${minimumBid} cents`,
        );
      }

      const bid = manager.create(Bid, {
        auctionId,
        userId: dto.userId,
        amountCents: dto.amountCents,
      });
      await manager.save(bid);

      auction.currentHighestBidCents = dto.amountCents;
      auction.highestBidderId = dto.userId;
      await manager.save(auction);

      return { bid, auction };
    });
  }

  async findExpiredActive(): Promise<Auction[]> {
    return this.auctionRepo.find({
      where: {
        status: 'active',
        endTime: LessThanOrEqual(new Date()),
      },
      relations: ['highestBidder'],
    });
  }

  async closeAuction(auction: Auction): Promise<Auction> {
    auction.status = 'closed';
    return this.auctionRepo.save(auction);
  }
}
