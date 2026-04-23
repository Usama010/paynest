import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionsService } from './auctions.service';
import { AuctionsGateway } from './auctions.gateway';

@Injectable()
export class AuctionsScheduler {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly gateway: AuctionsGateway,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async closeExpiredAuctions() {
    const expired = await this.auctionsService.findExpiredActive();

    for (const auction of expired) {
      await this.auctionsService.closeAuction(auction);

      this.gateway.emitAuctionEnded(auction.id, {
        auctionId: auction.id,
        winnerId: auction.highestBidderId,
        winnerName: auction.highestBidder?.displayName ?? null,
        winningBidCents: auction.currentHighestBidCents,
      });
    }
  }
}
