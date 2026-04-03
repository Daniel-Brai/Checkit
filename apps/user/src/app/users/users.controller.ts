import { Controller, UseInterceptors } from '@nestjs/common';
import {
  UserServiceController,
  UserServiceControllerMethods,
  CreateUserRequest,
  GetUserByIdRequest,
  GrpcLoggingInterceptor,
} from '@checkit/grpc';
import { UsersService } from './users.service';

@Controller()
@UserServiceControllerMethods()
@UseInterceptors(GrpcLoggingInterceptor)
export class UsersController implements UserServiceController {
  constructor(private readonly userService: UsersService) {}

  async createUser(request: CreateUserRequest) {
    return await this.userService.createUser(request);
  }

  async getUserById(request: GetUserByIdRequest) {
    return await this.userService.getUserById(request);
  }
}
