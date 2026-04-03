import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { WalletPrisma } from '@checkit/prisma';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWalletRequest,
  GetWalletRequest,
  CreditWalletRequest,
  DebitWalletRequest,
  WalletResponse,
  Wallet
} from '@checkit/grpc';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async createWallet(request: CreateWalletRequest): Promise<WalletResponse> {
    const existing = await this.prisma.wallet.findUnique({
      where: { userId: request.userId },
    });

    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Wallet already exists',
      });
    }

    const wallet = await this.prisma.wallet.create({
      data: { userId: request.userId },
    });

    return this.serialize(wallet);
  }

  async getWallet(request: GetWalletRequest): Promise<WalletResponse> {
    const wallet = await this.findWalletOrThrow(request.userId);
    return this.serialize(wallet);
  }

  async creditWallet(request: CreditWalletRequest): Promise<WalletResponse> {
    const amount = new WalletPrisma.Decimal(request.amount);

    this.assertPositiveAmount(amount);

    const wallet = await this.prisma.$transaction(async (tx) => {
      const current = await tx.wallet.findUnique({
        where: { userId: request.userId },
      });

      if (!current) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Wallet not found',
        });
      }

      return tx.wallet.update({
        where: { userId: request.userId },
        data: {
          balance: current.balance.add(amount),
        },
      });
    });

    return this.serialize(wallet);
  }

  async debitWallet(request: DebitWalletRequest): Promise<WalletResponse> {
    const amount = new WalletPrisma.Decimal(request.amount);

    this.assertPositiveAmount(amount);

    const wallet = await this.prisma.$transaction(async (tx) => {
      const current = await tx.wallet.findUnique({
        where: { userId: request.userId },
      });

      if (!current) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Wallet not found',
        });
      }

      if (current.balance.lessThan(amount)) {
        throw new RpcException({
          code: status.FAILED_PRECONDITION,
          message: `Insufficient balance. Current balance is ${current.balance.toFixed(2)} is less than requested debit amount ${amount.toFixed(2)}`,
        });
      }

      return tx.wallet.update({
        where: { userId: request.userId },
        data: {
          balance: current.balance.sub(amount),
        },
      });
    });

    return this.serialize(wallet);
  }

  private async findWalletOrThrow(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Wallet for user ${userId} not found`,
      });
    }

    return wallet;
  }

  private assertPositiveAmount(amount: WalletPrisma.Decimal) {
    if (amount.isNaN() || !amount.isFinite()) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'amount is not a valid number',
      });
    }

    if (amount.isZero() || amount.isNegative()) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'amount must be a positive number',
      });
    }
  }

  private serialize(wallet: Wallet): WalletResponse {
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance.toFixed(2),
      createdAt: wallet.createdAt.toISOString(),
    };
  }
}
