import pino from 'pino';

export const createLogger = (name = 'quiz-engine') =>
  pino({
    name,
    level: process.env['LOG_LEVEL'] ?? 'info',
  });

export type Logger = ReturnType<typeof createLogger>;

export const logger = createLogger();
