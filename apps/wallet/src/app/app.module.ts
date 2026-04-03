import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from '@checkit/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { WalletsModule } from './wallets';

@Module({
  imports: [
    LoggerModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TerminusModule.forRoot({ gracefulShutdownTimeoutMs: 5000 }),
    WalletsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
