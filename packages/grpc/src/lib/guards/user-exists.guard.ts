/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Logger,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { USER_SERVICE_NAME, UserServiceClient } from '../types';

@Injectable()
export class GrpcUserExistsGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(GrpcUserExistsGuard.name);

  private userService!: UserServiceClient;

  constructor(@Inject(USER_SERVICE_NAME) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData<{ userId: string }>();

    if (!data?.userId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'userId is required',
      });
    }

    try {
      const user = await firstValueFrom(
        this.userService.getUserById({ id: data.userId }),
      );

      if (!user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      return true;
    } catch (error: any) {
      this.logger.error({
        message: 'Error validating user existence',
        error: error.message,
        userId: data.userId,
      });
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });
    }
  }
}
