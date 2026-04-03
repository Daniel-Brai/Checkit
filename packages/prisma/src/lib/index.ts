export {
  Prisma as UserPrisma,
  PrismaClient as UserPrismaClient,
  User,
} from './user/client';

export * as UserInputTypes from './user/commonInputTypes';

export {
  Prisma as WalletPrisma,
  PrismaClient as WalletPrismaClient,
  Wallet,
} from './wallet/client';

export * as WalletInputTypes from './wallet/commonInputTypes';
