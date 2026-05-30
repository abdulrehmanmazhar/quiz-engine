export class QuizEngineError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = 'QuizEngineError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const ErrorCodes = {
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_INACTIVE: 'SESSION_INACTIVE',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  QUESTION_NOT_FOUND: 'QUESTION_NOT_FOUND',
  SIGNATURE_MISMATCH: 'SIGNATURE_MISMATCH',
  QUESTION_EXPIRED: 'QUESTION_EXPIRED',
  NAVIGATION_DENIED: 'NAVIGATION_DENIED',
  REATTEMPT_DENIED: 'REATTEMPT_DENIED',
  INVALID_OPTION: 'INVALID_OPTION',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESULT_NOT_FOUND: 'RESULT_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
