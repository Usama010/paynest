import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewBidEvent, AuctionEndedEvent } from './types/events';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class AuctionsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_auction')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { auctionId: string },
  ) {
    void client.join(`auction:${payload.auctionId}`);
  }

  @SubscribeMessage('leave_auction')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { auctionId: string },
  ) {
    void client.leave(`auction:${payload.auctionId}`);
  }

  emitNewBid(auctionId: string, data: NewBidEvent) {
    this.server.to(`auction:${auctionId}`).emit('new_bid', data);
  }

  emitAuctionEnded(auctionId: string, data: AuctionEndedEvent) {
    this.server.to(`auction:${auctionId}`).emit('auction_ended', data);
  }
}
