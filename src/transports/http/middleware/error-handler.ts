import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { QuizEngineError, ErrorCodes } from '../../../utils/errors.js';
import type { Logger } from '../../../utils/logger.js';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const createErrorHandler = (logger: Logger) =>
  (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof QuizEngineError) {
      logger.warn({ code: err.code, message: err.message }, err.message);
      const body: ErrorResponse = {
        error: {
          code: err.code,
          message: err.message,
        },
      };
      res.status(err.statusCode).json(body);
      return;
    }

    if (err instanceof ZodError) {
      logger.warn({ err: err.errors }, 'Validation error');
      const body: ErrorResponse = {
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Request validation failed',
          details: err.errors,
        },
      };
      res.status(400).json(body);
      return;
    }

    logger.error({ err }, 'Unhandled error');
    const body: ErrorResponse = {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An internal error occurred',
      },
    };
    res.status(500).json(body);
  };

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
