import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepo.count();
    if (count >= 100) return;

    const users = Array.from({ length: 100 }, (_, i) => {
      const num = String(i + 1).padStart(3, '0');
      return this.userRepo.create({
        username: `user_${num}`,
        displayName: `User ${i + 1}`,
      });
    });

    await this.userRepo.upsert(users, ['username']);
  }
}
