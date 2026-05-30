import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

type RequestSource = 'body' | 'params' | 'query';

export const validate =
  (schema: ZodSchema, source: RequestSource = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[source];
    schema.parse(data);
    next();
  };
