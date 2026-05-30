import type { SubmitAttemptInput, SubmitAttemptResult } from '../types/attempt.js';
import type { ResultDocument } from '../types/result.js';
import type { SessionDocument } from '../types/session.js';
import type { StoredQuestion } from '../types/session.js';
import type { QuizStorage } from '../storage/types.js';
import type { Logger } from '../utils/logger.js';
import {
  generateAttemptId,
  nowUtc,
  toUtcIsoString,
  calculateScore,
  toPerformance,
  isExpired,
  QuizEngineError,
  ErrorCodes,
} from '../utils/index.js';
import {
  assertSessionActive,
  assertSignatureMatches,
  assertSessionNotExpired,
  assertQuestionNotExpired,
  getQuestionSequenceIndex,
  assertValidOptionIndex,
  assertNavigationAllowed,
  assertReAttemptAllowed,
  computeNextQuestionIndex,
  isSessionComplete,
} from './validators/index.js';

export interface SubmitAttemptDeps {
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

const requireQuestion = (
  session: SessionDocument,
  questionId: string,
): StoredQuestion => {
  const question = session.questions.find((q) => q.questionId === questionId);
  if (!question) {
    throw new QuizEngineError(
      `Question not found: ${questionId}`,
      ErrorCodes.QUESTION_NOT_FOUND,
      404,
    );
  }
  return question;
};

const persistResult = async (
  storage: QuizStorage,
  sessionId: string,
  session: SessionDocument,
  completedAt: string,
): Promise<ResultDocument> => {
  const attempts = await storage.findAttemptsBySessionId(sessionId);
  const breakdown = calculateScore(session.config, session.questions.length, attempts);

  const result: ResultDocument = {
    sessionId,
    totalQuestions: session.questions.length,
    attempted: breakdown.attempted,
    skipped: breakdown.skipped,
    correct: breakdown.correct,
    incorrect: breakdown.incorrect,
    score: breakdown.score,
    percentage: breakdown.percentage,
    startedAt: session.startedAt,
    completedAt,
    createdAt: completedAt,
  };

  await storage.createResult(result);
  return result;
};

export const submitAttempt = async (
  deps: SubmitAttemptDeps,
  input: SubmitAttemptInput,
): Promise<SubmitAttemptResult> => {
  const { storage, logger } = deps;
  const now = nowUtc();

  const session = await requireSession(storage, input.sessionId);
  assertSessionActive(session);

  if (isExpired(session.expiresAt, now)) {
    await storage.markSessionExpired(session.sessionId);
    throw new QuizEngineError(
      'Session time has expired',
      ErrorCodes.SESSION_EXPIRED,
      410,
    );
  }

  assertSessionNotExpired(session, now);

  const question = requireQuestion(session, input.questionId);

  assertSignatureMatches(question.questionSignature, input.questionSignature, input.questionId);
  assertValidOptionIndex(input.optionIndex, question.totalOptions, input.questionId);
  assertQuestionNotExpired(session.questionTimers, input.questionId, now);

  const questionIndex = getQuestionSequenceIndex(session, input.questionId);
  if (questionIndex === -1) {
    throw new QuizEngineError(
      `Question not in sequence: ${input.questionId}`,
      ErrorCodes.QUESTION_NOT_FOUND,
      404,
    );
  }

  assertNavigationAllowed(session.config, session, questionIndex);

  const existingAttempt = await storage.findAttemptBySessionAndQuestion(
    input.sessionId,
    input.questionId,
  );
  assertReAttemptAllowed(session.config, existingAttempt !== null);

  const isCorrect = input.optionIndex === question.correctOptionIndex;
  const submittedAt = toUtcIsoString(now);

  if (existingAttempt) {
    await storage.updateAttempt(input.sessionId, input.questionId, {
      optionIndex: input.optionIndex,
      questionSignature: input.questionSignature,
      isCorrect,
      submittedAt,
    });
  } else {
    await storage.createAttempt({
      attemptId: generateAttemptId(),
      sessionId: input.sessionId,
      questionId: input.questionId,
      optionIndex: input.optionIndex,
      questionSignature: input.questionSignature,
      isCorrect,
      submittedAt,
    });
  }

  const nextIndex = computeNextQuestionIndex(session, questionIndex);
  const allAttempts = await storage.findAttemptsBySessionId(input.sessionId);
  const uniqueAttemptedQuestions = new Set(allAttempts.map((a) => a.questionId));
  const sessionComplete = isSessionComplete(session, uniqueAttemptedQuestions.size);

  let sessionStatus = session.status;

  if (sessionComplete) {
    const completedAt = submittedAt;
    await storage.updateSession(input.sessionId, {
      currentQuestionIndex: nextIndex,
      status: 'completed',
      completedAt,
    });
    await persistResult(storage, input.sessionId, session, completedAt);
    sessionStatus = 'completed';

    logger.info({ sessionId: input.sessionId, completedAt }, 'Session completed');
  } else {
    await storage.updateSession(input.sessionId, {
      currentQuestionIndex: nextIndex,
    });
  }

  logger.info(
    {
      sessionId: input.sessionId,
      questionId: input.questionId,
      isCorrect,
    },
    'Attempt submitted',
  );

  const result: SubmitAttemptResult = {
    accepted: true,
    questionId: input.questionId,
    isCorrect,
    currentQuestionIndex: nextIndex,
    sessionStatus,
  };

  if (session.config.allowed_realTimePerformance) {
    const performanceAttempts = await storage.findAttemptsBySessionId(input.sessionId);
    const breakdown = calculateScore(
      session.config,
      session.questions.length,
      performanceAttempts,
    );
    result.performance = toPerformance(breakdown);
  }

  return result;
};
