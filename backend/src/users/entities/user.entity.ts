import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Bid } from '../../auctions/entities/bid.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  displayName: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Bid, (bid) => bid.user)
  bids: Bid[];
}
