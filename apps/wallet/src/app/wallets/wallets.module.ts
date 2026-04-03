import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import {
  USER_PACKAGE_NAME,
  USER_SERVICE_NAME,
  GrpcUserExistsGuard,
} from '@checkit/grpc';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: USER_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: config.getOrThrow<string>('USER_GRPC_URL'),
            package: USER_PACKAGE_NAME,
            protoPath: join(__dirname, '../../packages/grpc/proto/user.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService, GrpcUserExistsGuard],
})
export class WalletsModule {}
