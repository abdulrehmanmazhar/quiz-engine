import type { SessionResult } from '../types/result.js';
import type { SessionDocument } from '../types/session.js';
import type { QuizStorage } from '../storage/types.js';
import type { Logger } from '../utils/logger.js';
import { QuizEngineError, ErrorCodes, calculateScore } from '../utils/index.js';

export interface GetResultDeps {
  storage: QuizStorage;
  logger: Logger;
}

const requireSession = async (
  storage: QuizStorage,
  sessionId: string,
): Promise<SessionDocument> => {
  const session = await storage.findSessionById(sessionId);
  if (!session) {
    throw new QuizEngineError(
      `Session not found: ${sessionId}`,
      ErrorCodes.SESSION_NOT_FOUND,
      404,
    );
  }
  return session;
};

export const getSessionResult = async (
  deps: GetResultDeps,
  sessionId: string,
): Promise<SessionResult> => {
  const { storage } = deps;

  const existingResult = await storage.findResultBySessionId(sessionId);
  if (existingResult) {
    return {
      totalQuestions: existingResult.totalQuestions,
      attempted: existingResult.attempted,
      skipped: existingResult.skipped,
      correct: existingResult.correct,
      incorrect: existingResult.incorrect,
      score: existingResult.score,
      percentage: existingResult.percentage,
      startedAt: existingResult.startedAt,
      ...(existingResult.completedAt !== undefined
        ? { completedAt: existingResult.completedAt }
        : {}),
    };
  }

  const session = await requireSession(storage, sessionId);
  const attempts = await storage.findAttemptsBySessionId(sessionId);
  const breakdown = calculateScore(session.config, session.questions.length, attempts);

  if (session.status === 'active' && attempts.length === 0) {
    throw new QuizEngineError(
      'Session result is not yet available',
      ErrorCodes.RESULT_NOT_FOUND,
      404,
    );
  }

  return {
    totalQuestions: session.questions.length,
    attempted: breakdown.attempted,
    skipped: breakdown.skipped,
    correct: breakdown.correct,
    incorrect: breakdown.incorrect,
    score: breakdown.score,
    percentage: breakdown.percentage,
    startedAt: session.startedAt,
    ...(session.completedAt !== undefined ? { completedAt: session.completedAt } : {}),
  };
};
