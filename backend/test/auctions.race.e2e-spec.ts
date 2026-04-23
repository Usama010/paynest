import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import request from 'supertest';

describe('Bid Race Condition (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should only accept one bid when two identical bids race', async () => {
    const usersRes = await request(app.getHttpServer()).get('/api/users');
    const user1 = usersRes.body[0];
    const user2 = usersRes.body[1];

    const auctionRes = await request(app.getHttpServer())
      .post('/api/auctions')
      .send({
        name: 'Race Test',
        description: 'Testing concurrent bids',
        startingPriceCents: 1000,
        durationSeconds: 300,
      });

    const auctionId = auctionRes.body.id;

    const results = await Promise.allSettled([
      request(app.getHttpServer())
        .post(`/api/auctions/${auctionId}/bids`)
        .send({ userId: user1.id, amountCents: 1000 }),
      request(app.getHttpServer())
        .post(`/api/auctions/${auctionId}/bids`)
        .send({ userId: user2.id, amountCents: 1000 }),
    ]);

    const responses = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value);

    const successes = responses.filter((r) => r.status === 201);
    const failures = responses.filter((r) => r.status === 400);

    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
    expect(failures[0].body.message).toContain('Bid must be at least');
  });

  it('should reject bids on expired auctions', async () => {
    const usersRes = await request(app.getHttpServer()).get('/api/users');
    const user = usersRes.body[0];

    const auctionRes = await request(app.getHttpServer())
      .post('/api/auctions')
      .send({
        name: 'Expired Test',
        description: 'This auction expires immediately',
        startingPriceCents: 1000,
        durationSeconds: 60,
      });

    const auctionId = auctionRes.body.id;

    // Manually set end_time to the past
    await dataSource.query(
      `UPDATE auctions SET "endTime" = NOW() - INTERVAL '1 minute' WHERE id = $1`,
      [auctionId],
    );

    const bidRes = await request(app.getHttpServer())
      .post(`/api/auctions/${auctionId}/bids`)
      .send({ userId: user.id, amountCents: 1000 });

    expect(bidRes.status).toBe(400);
    expect(bidRes.body.message).toContain('Auction has ended');
  });
});
