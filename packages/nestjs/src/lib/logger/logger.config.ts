import { randomUUID } from 'crypto';
import type { IncomingMessage } from 'http';
import type { Request } from 'express';
import type { Params } from 'nestjs-pino';
import { multistream, type DestinationStream, pino } from 'pino';
import type { Options } from 'pino-http';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const DEFAULT_LOG_LEVEL: Record<'production' | 'development', LogLevel> = {
  production: 'info',
  development: 'debug',
};

const resolveLogLevel = (logLevel?: LogLevel): LogLevel => {
  if (logLevel) return logLevel;
  return process.env['NODE_ENV'] === 'production'
    ? DEFAULT_LOG_LEVEL.production
    : DEFAULT_LOG_LEVEL.development;
};

export const DEFAULT_PASS_URLS = new Set(['/health']);

export const genReqId = (req: IncomingMessage): string =>
  (req.headers['x-request-id'] as string) ?? randomUUID();

export const buildLoggerOptions = (
  passUrls: Set<string> = DEFAULT_PASS_URLS,
  logLevel?: LogLevel,
): Params => {
  const level = resolveLogLevel(logLevel);

  const stream = multistream(
    [
      { level: 'debug', stream: process.stdout },
      { level: 'error', stream: process.stderr },
      { level: 'fatal', stream: process.stderr },
    ],
    { dedupe: true },
  ) as DestinationStream;

  // build the pino logger instance directly so we can set level cleanly
  const logger = pino(
    {
      level,
      ...(process.env['NODE_ENV'] !== 'production' && {
        transport: {
          target: 'pino-pretty',
          options: { sync: true, singleLine: true },
        },
      }),
    },
    stream,
  );

  return {
    pinoHttp: [
      {
        logger, // level lives on the logger instance, not on Options
        quietReqLogger: true,
        genReqId,
        autoLogging: {
          ignore: (req) => passUrls.has((req as Request).originalUrl),
        },
        customProps: (req: IncomingMessage) => ({
          requestId: req.headers['x-request-id'] ?? randomUUID(),
        }),
      } satisfies Options,
      stream,
    ],
  };
};
