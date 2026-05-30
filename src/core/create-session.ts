import type { CreateSessionInput, CreateSessionResult, SessionDocument, StoredQuestion } from '../types/session.js';
import type { QuizStorage } from '../storage/types.js';
import type { Logger } from '../utils/logger.js';
import { generateSessionId, toUtcIsoString, nowUtc } from '../utils/index.js';
import { buildQuestionTimers, buildSessionExpiry } from './validators/timing.validator.js';

export interface CreateSessionDeps {
  storage: QuizStorage;
  logger: Logger;
}

const buildStoredQuestions = (questions: CreateSessionInput['questions']): StoredQuestion[] =>
  questions.map((q, index) => ({
    ...q,
    sequenceIndex: index,
  }));

export const createSession = async (
  deps: CreateSessionDeps,
  input: CreateSessionInput,
): Promise<CreateSessionResult> => {
  const { storage, logger } = deps;
  const sessionStart = nowUtc();
  const createdAt = toUtcIsoString(sessionStart);
  const sessionId = generateSessionId();

  const questionSequence = input.questions.map((q) => q.questionId);
  const questionTimers = buildQuestionTimers(
    questionSequence,
    sessionStart,
    input.config.allowed_questionTime,
    input.config.questionTimeValue,
  );

  const expiresAt = buildSessionExpiry(
    sessionStart,
    input.config.allowed_sessionTime,
    input.config.sessionTimeValue,
  );

  const session: SessionDocument = {
    sessionId,
    config: input.config,
    questions: buildStoredQuestions(input.questions),
    questionSequence,
    questionTimers,
    currentQuestionIndex: 0,
    status: 'active',
    createdAt,
    startedAt: createdAt,
    ...(expiresAt !== undefined ? { expiresAt } : {}),
  };

  await storage.createSession(session);

  logger.info(
    {
      sessionId,
      questionCount: questionSequence.length,
      expiresAt,
    },
    'Session created',
  );

  const result: CreateSessionResult = {
    sessionId,
    createdAt,
    ...(expiresAt !== undefined ? { expiresAt } : {}),
  };

  return result;
};
