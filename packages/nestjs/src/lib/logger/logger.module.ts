import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import {
  buildLoggerOptions,
  DEFAULT_PASS_URLS,
  LogLevel,
} from './logger.config';

export interface LoggerModuleOptions {
  excludeUrls?: string[];
  logLevel?: LogLevel;
}

@Global()
@Module({})
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions = {}): DynamicModule {
    const passUrls = new Set([
      ...DEFAULT_PASS_URLS,
      ...(options.excludeUrls ?? []),
    ]);

    return {
      module: LoggerModule,
      imports: [
        PinoLoggerModule.forRoot(
          buildLoggerOptions(passUrls, options.logLevel),
        ),
      ],
      exports: [PinoLoggerModule],
    };
  }

  static forRootAsync(options: LoggerModuleOptions = {}): DynamicModule {
    const passUrls = new Set([
      ...DEFAULT_PASS_URLS,
      ...(options.excludeUrls ?? []),
    ]);

    return {
      module: LoggerModule,
      imports: [
        PinoLoggerModule.forRootAsync({
          useFactory: () => buildLoggerOptions(passUrls, options.logLevel),
        }),
      ],
      exports: [PinoLoggerModule],
    };
  }
}
