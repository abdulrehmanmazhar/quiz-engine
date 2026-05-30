import { Router } from 'express';
import type { Logger } from '../../utils/logger.js';
import type { QuizStorage } from '../../storage/types.js';
import {
  createSession,
  syncSession,
  submitAttempt,
  getSessionResult,
} from '../../core/index.js';
import {
  createSessionSchema,
  syncSessionSchema,
  submitAttemptSchema,
  sessionIdParamSchema,
} from '../../schemas/index.js';
import { validate } from './middleware/validate.js';
import { asyncHandler } from './middleware/error-handler.js';

export interface CreateHttpRouterDeps {
  storage: QuizStorage;
  logger: Logger;
}

export const createHttpRouter = (deps: CreateHttpRouterDeps): Router => {
  const { storage, logger } = deps;
  const router = Router();

  router.post(
    '/session/create',
    validate(createSessionSchema),
    asyncHandler(async (req, res) => {
      const result = await createSession({ storage, logger }, req.body);
      res.status(201).json(result);
    }),
  );

  router.post(
    '/session/sync',
    validate(syncSessionSchema),
    asyncHandler(async (req, res) => {
      const { sessionId } = req.body as { sessionId: string };
      const result = await syncSession({ storage, logger }, sessionId);
      res.json(result);
    }),
  );

  router.post(
    '/attempt',
    validate(submitAttemptSchema),
    asyncHandler(async (req, res) => {
      const result = await submitAttempt({ storage, logger }, req.body);
      res.json(result);
    }),
  );

  router.get(
    '/result/:sessionId',
    validate(sessionIdParamSchema, 'params'),
    asyncHandler(async (req, res) => {
      const { sessionId } = req.params as { sessionId: string };
      const result = await getSessionResult({ storage, logger }, sessionId);
      res.json(result);
    }),
  );

  return router;
};
