export { QuizEngine } from './engine.js';

export type {
  QuizConfig,
  SessionQuestion,
  SessionStatus,
  CreateSessionInput,
  CreateSessionResult,
  SyncSessionResult,
  SubmitAttemptInput,
  SubmitAttemptResult,
  RealTimePerformance,
  SessionResult,
  QuizEngineConfig,
  EngineMode,
  IpcHandlers,
} from './types/index.js';

export {
  createSession,
  syncSession,
  submitAttempt,
  getSessionResult,
} from './core/index.js';

export { createMongoStorage } from './storage/mongodb/index.js';
export type { QuizStorage } from './storage/types.js';

export { createHttpServer } from './transports/http/server.js';
export { createHttpRouter } from './transports/http/routes.js';
export { createIpcHandlers } from './transports/ipc/index.js';

export {
  quizConfigSchema,
  sessionQuestionSchema,
  createSessionSchema,
  syncSessionSchema,
  submitAttemptSchema,
  sessionIdParamSchema,
} from './schemas/index.js';

export {
  QuizEngineError,
  ErrorCodes,
  createLogger,
  calculateScore,
} from './utils/index.js';

export type { Logger, ScoreBreakdown } from './utils/index.js';
