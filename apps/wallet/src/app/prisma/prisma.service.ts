import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WalletPrismaClient } from '@checkit/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends WalletPrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.WALLET_DATABASE_URL,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
