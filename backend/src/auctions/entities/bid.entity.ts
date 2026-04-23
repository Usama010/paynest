import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Auction } from './auction.entity';
import { User } from '../../users/entities/user.entity';

const bigintTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseInt(value, 10),
};

@Entity('bids')
@Index(['auctionId', 'createdAt'])
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  auctionId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  amountCents: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Auction, (a) => a.bids)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction;

  @ManyToOne(() => User, (u) => u.bids)
  @JoinColumn({ name: 'userId' })
  user: User;
}
