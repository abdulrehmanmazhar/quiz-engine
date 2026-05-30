import { QuizEngineError, ErrorCodes } from '../../utils/errors.js';
import type { SessionDocument } from '../../types/session.js';
import type { StoredQuestion } from '../../types/session.js';

export const assertSessionExists = (
  session: SessionDocument | null,
  sessionId: string,
): asserts session is SessionDocument => {
  if (!session) {
    throw new QuizEngineError(
      `Session not found: ${sessionId}`,
      ErrorCodes.SESSION_NOT_FOUND,
      404,
    );
  }
};

export const assertSessionActive = (session: SessionDocument): void => {
  if (session.status === 'completed') {
    throw new QuizEngineError(
      'Session is already completed',
      ErrorCodes.SESSION_INACTIVE,
      409,
    );
  }

  if (session.status === 'expired') {
    throw new QuizEngineError(
      'Session has expired',
      ErrorCodes.SESSION_EXPIRED,
      410,
    );
  }

  if (session.status === 'quit') {
    throw new QuizEngineError(
      'Session was quit early',
      ErrorCodes.SESSION_INACTIVE,
      409,
    );
  }
};

export const findQuestionInSession = (
  session: SessionDocument,
  questionId: string,
): StoredQuestion | undefined =>
  session.questions.find((q) => q.questionId === questionId);

export const assertQuestionExists = (
  question: StoredQuestion | undefined,
  questionId: string,
): asserts question is StoredQuestion => {
  if (!question) {
    throw new QuizEngineError(
      `Question not found: ${questionId}`,
      ErrorCodes.QUESTION_NOT_FOUND,
      404,
    );
  }
};
