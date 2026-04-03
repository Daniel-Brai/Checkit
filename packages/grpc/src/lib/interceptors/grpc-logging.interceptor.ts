/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class GrpcLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcLoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const handler = context.getHandler();
    const handlerName = handler.name;
    const args = context.getArgs()[0];
    const start = Date.now();

    const requestId = randomUUID();

    this.logger.log({
      requestId,
      handler: handlerName,
      args,
      message: 'gRPC Request started',
    });

    return next.handle().pipe(
      tap(() => {
        this.logger.log({
          requestId,
          handler: handlerName,
          duration: `${Date.now() - start}ms`,
          message: 'gRPC Request completed',
        });
      }),
    );
  }
}
