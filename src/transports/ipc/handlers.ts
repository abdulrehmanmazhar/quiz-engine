import type { IpcHandlers } from '../../types/engine.js';
import type { Logger } from '../../utils/logger.js';
import type { QuizStorage } from '../../storage/types.js';
import {
  createSession,
  syncSession,
  submitAttempt,
  getSessionResult,
} from '../../core/index.js';
import type { CreateSessionInput } from '../../types/session.js';
import type { SubmitAttemptInput } from '../../types/attempt.js';
import { createSessionSchema, submitAttemptSchema } from '../../schemas/index.js';

export interface CreateIpcHandlersDeps {
  storage: QuizStorage;
  logger: Logger;
}

export const createIpcHandlers = (deps: CreateIpcHandlersDeps): IpcHandlers => {
  const { storage, logger } = deps;

  return {
    async createSession(input: CreateSessionInput) {
      const validated = createSessionSchema.parse(input);
      return createSession({ storage, logger }, validated);
    },

    async syncSession(sessionId: string) {
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('sessionId is required');
      }
      return syncSession({ storage, logger }, sessionId);
    },

    async submitAttempt(input: SubmitAttemptInput) {
      const validated = submitAttemptSchema.parse(input);
      return submitAttempt({ storage, logger }, validated);
    },

    async getSessionResult(sessionId: string) {
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('sessionId is required');
      }
      return getSessionResult({ storage, logger }, sessionId);
    },
  };
};
