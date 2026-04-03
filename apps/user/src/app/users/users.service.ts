import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { User } from '@checkit/prisma';
import {
  CreateUserRequest,
  GetUserByIdRequest,
  UserResponse,
} from '@checkit/grpc';
import { PrismaService } from '../prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: request.email },
    });

    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: `User with email ${request.email} already exists`,
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: request.email,
        name: request.name,
      },
    });

    return this.serialize(user);
  }

  async getUserById(request: GetUserByIdRequest): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: request.id },
    });

    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });
    }

    return this.serialize(user);
  }

  private serialize(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
