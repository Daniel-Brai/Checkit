import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from '@checkit/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { UsersModule } from './users';

@Module({
  imports: [
    LoggerModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TerminusModule.forRoot({ gracefulShutdownTimeoutMs: 5000 }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
