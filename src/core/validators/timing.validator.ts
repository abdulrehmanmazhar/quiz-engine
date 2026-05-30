import { QuizEngineError, ErrorCodes, isExpired } from '../../utils/index.js';
import type { SessionDocument, QuestionTimer } from '../../types/session.js';

export const assertSessionNotExpired = (
  session: SessionDocument,
  now: Date,
): void => {
  if (isExpired(session.expiresAt, now)) {
    throw new QuizEngineError(
      'Session time has expired',
      ErrorCodes.SESSION_EXPIRED,
      410,
    );
  }
};

export const assertQuestionNotExpired = (
  questionTimers: QuestionTimer[],
  questionId: string,
  now: Date,
): void => {
  const timer = questionTimers.find((t) => t.questionId === questionId);

  if (timer && isExpired(timer.expiresAt, now)) {
    throw new QuizEngineError(
      `Question time has expired for question: ${questionId}`,
      ErrorCodes.QUESTION_EXPIRED,
      410,
    );
  }
};

export const buildQuestionTimers = (
  questionSequence: string[],
  sessionStart: Date,
  allowedQuestionTime: boolean,
  questionTimeValueSeconds: number,
): QuestionTimer[] => {
  if (!allowedQuestionTime || questionTimeValueSeconds <= 0) {
    return [];
  }

  return questionSequence.map((questionId, index) => ({
    questionId,
    expiresAt: new Date(
      sessionStart.getTime() + (index + 1) * questionTimeValueSeconds * 1000,
    ).toISOString(),
  }));
};

export const buildSessionExpiry = (
  sessionStart: Date,
  allowedSessionTime: boolean,
  sessionTimeValueSeconds: number,
): string | undefined => {
  if (!allowedSessionTime || sessionTimeValueSeconds <= 0) {
    return undefined;
  }

  return new Date(sessionStart.getTime() + sessionTimeValueSeconds * 1000).toISOString();
};
