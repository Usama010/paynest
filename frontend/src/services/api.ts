import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export interface User {
  id: string;
  username: string;
  displayName: string;
}

export interface Auction {
  id: string;
  name: string;
  description: string;
  startingPriceCents: number;
  currentHighestBidCents: number;
  durationSeconds: number;
  endTime: string;
  status: 'active' | 'closed';
  highestBidderId: string | null;
  highestBidder: User | null;
  createdAt: string;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amountCents: number;
  createdAt: string;
  user?: User;
}

export interface CreateAuctionPayload {
  name: string;
  description: string;
  startingPriceCents: number;
  durationSeconds: number;
}

export interface PlaceBidPayload {
  userId: string;
  amountCents: number;
}

export const getUsers = () => api.get<User[]>('/users').then((r) => r.data);

export const getAuctions = () =>
  api.get<Auction[]>('/auctions').then((r) => r.data);

export const getAuction = (id: string) =>
  api.get<Auction>(`/auctions/${id}`).then((r) => r.data);

export const createAuction = (data: CreateAuctionPayload) =>
  api.post<Auction>('/auctions', data).then((r) => r.data);

export const placeBid = (auctionId: string, data: PlaceBidPayload) =>
  api
    .post<{ bid: Bid; auction: Auction }>(`/auctions/${auctionId}/bids`, data)
    .then((r) => r.data);
