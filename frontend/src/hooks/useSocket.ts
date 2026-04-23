import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_WS_URL || '/', {
      transports: ['websocket'],
    });
  }
  return socket;
}

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

export function useAuctionSocket(
  auctionId: string | undefined,
  handlers: {
    onNewBid: (data: NewBidEvent) => void;
    onAuctionEnded: (data: AuctionEndedEvent) => void;
  },
) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!auctionId) return;
    const s = getSocket();
    const onNewBid = (data: NewBidEvent) => handlersRef.current.onNewBid(data);
    const onAuctionEnded = (data: AuctionEndedEvent) => handlersRef.current.onAuctionEnded(data);
    s.emit('join_auction', { auctionId });
    s.on('new_bid', onNewBid);
    s.on('auction_ended', onAuctionEnded);
    return () => {
      s.emit('leave_auction', { auctionId });
      s.off('new_bid', onNewBid);
      s.off('auction_ended', onAuctionEnded);
    };
  }, [auctionId]);
}

export function useGlobalSocket(handlers: {
  onNewBid?: (data: NewBidEvent) => void;
  onAuctionEnded?: (data: AuctionEndedEvent) => void;
}) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const s = getSocket();
    const onNewBid = (data: NewBidEvent) => handlersRef.current.onNewBid?.(data);
    const onAuctionEnded = (data: AuctionEndedEvent) => handlersRef.current.onAuctionEnded?.(data);
    s.on('new_bid', onNewBid);
    s.on('auction_ended', onAuctionEnded);
    return () => {
      s.off('new_bid', onNewBid);
      s.off('auction_ended', onAuctionEnded);
    };
  }, []);
}
