import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  WalletServiceController,
  WalletServiceControllerMethods,
  CreateWalletRequest,
  GetWalletRequest,
  CreditWalletRequest,
  DebitWalletRequest,
  GrpcUserExistsGuard,
  GrpcLoggingInterceptor,
} from '@checkit/grpc';
import { WalletsService } from './wallets.service';

@Controller()
@WalletServiceControllerMethods()
@UseInterceptors(GrpcLoggingInterceptor)
export class WalletsController implements WalletServiceController {
  constructor(private readonly walletService: WalletsService) {}

  @UseGuards(GrpcUserExistsGuard)
  async createWallet(request: CreateWalletRequest) {
    return await this.walletService.createWallet(request);
  }

  async getWallet(request: GetWalletRequest) {
    return await this.walletService.getWallet(request);
  }

  async creditWallet(request: CreditWalletRequest) {
    return await this.walletService.creditWallet(request);
  }

  async debitWallet(request: DebitWalletRequest) {
    return await this.walletService.debitWallet(request);
  }
}
