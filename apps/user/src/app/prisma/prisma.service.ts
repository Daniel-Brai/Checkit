import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { UserPrismaClient } from '@checkit/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends UserPrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.USER_DATABASE_URL,
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
