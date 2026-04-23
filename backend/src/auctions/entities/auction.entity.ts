import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Bid } from './bid.entity';
import { User } from '../../users/entities/user.entity';

const bigintTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseInt(value, 10),
};

@Entity('auctions')
@Index(['status', 'endTime'])
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  startingPriceCents: number;

  @Column({ type: 'bigint', default: 0, transformer: bigintTransformer })
  currentHighestBidCents: number;

  @Column({ type: 'int' })
  durationSeconds: number;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'varchar', default: 'active' })
  status: 'active' | 'closed';

  @Column({ type: 'uuid', nullable: true })
  highestBidderId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'highestBidderId' })
  highestBidder: User;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];
}
