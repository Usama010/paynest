import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuctionsService } from './auctions.service';
import { AuctionsGateway } from './auctions.gateway';
import { UsersService } from '../users/users.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';

@Controller('auctions')
export class AuctionsController {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly auctionsGateway: AuctionsGateway,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(@Body() dto: CreateAuctionDto) {
    return this.auctionsService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.auctionsService.findAll({
      page: parseInt(page || '1'),
      limit: Math.min(parseInt(limit || '12'), 50),
      status: status,
      search,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctionsService.findOne(id);
  }

  @Post(':id/bids')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async placeBid(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PlaceBidDto,
  ) {
    const result = await this.auctionsService.placeBid(id, dto);
    const user = await this.usersService.findOne(dto.userId);

    this.auctionsGateway.emitNewBid(id, {
      auctionId: id,
      amountCents: dto.amountCents,
      userId: dto.userId,
      username: user?.displayName ?? 'Unknown',
      timestamp: result.bid.createdAt.toISOString(),
    });

    return result;
  }
}
