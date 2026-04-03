require('module-alias/register');

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { USER_PACKAGE_NAME } from '@checkit/grpc';
import { PinoLogger } from '@checkit/nestjs';
import { AppModule } from './app/app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);

  app.useLogger(app.get(PinoLogger));

  const http_port = configService.getOrThrow<number>('USER_HTTP_PORT');
  const grpc_port = configService.getOrThrow<number>('USER_GRPC_PORT');

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: USER_PACKAGE_NAME,
      url: `0.0.0.0:${grpc_port}`,
      protoPath: join(__dirname, '../../packages/grpc/proto/user.proto'),
    },
  });

  await app.startAllMicroservices();

  await app.listen(http_port);

  Logger.log(`[HTTP]: Application is running on: http://0.0.0.0:${http_port}`);
  Logger.log(`[gRPC]: Application is running on: http://0.0.0.0:${grpc_port}`);
}

bootstrap();
