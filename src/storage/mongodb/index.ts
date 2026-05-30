import type { QuizStorage } from '../types.js';
import type { Logger } from '../../utils/logger.js';
import { connectMongo, disconnectMongo } from './connection.js';
import { createSessionRepository } from './repositories/session.repository.js';
import { createAttemptRepository } from './repositories/attempt.repository.js';
import { createResultRepository } from './repositories/result.repository.js';

export const createMongoStorage = (mongoUri: string, logger?: Logger): QuizStorage => {
  const sessionRepo = createSessionRepository();
  const attemptRepo = createAttemptRepository();
  const resultRepo = createResultRepository();

  return {
    ...sessionRepo,
    ...attemptRepo,
    ...resultRepo,

    async connect(): Promise<void> {
      await connectMongo(mongoUri, logger);
    },

    async disconnect(): Promise<void> {
      await disconnectMongo(logger);
    },
  };
};

export { connectMongo, disconnectMongo } from './connection.js';
