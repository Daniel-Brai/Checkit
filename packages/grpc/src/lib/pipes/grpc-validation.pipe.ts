import { ValidationPipe } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

export class GrpcValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) =>
          Object.values(error.constraints ?? {}).join(', '),
        );

        return new RpcException({
          code: status.INVALID_ARGUMENT,
          message: messages.join('; '),
        });
      },
    });
  }
}
