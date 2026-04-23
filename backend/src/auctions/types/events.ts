export interface NewBidEvent {
  auctionId: string;
  amountCents: number;
  userId: string;
  username: string;
  timestamp: string;
}

export interface AuctionEndedEvent {
  auctionId: string;
  winnerId: string | null;
  winnerName: string | null;
  winningBidCents: number;
}
