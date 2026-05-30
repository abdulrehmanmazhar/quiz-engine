import { QuizEngineError, ErrorCodes } from '../../utils/errors.js';
import type { SessionDocument } from '../../types/session.js';
import type { QuizConfig } from '../../types/config.js';

export const getQuestionSequenceIndex = (
  session: SessionDocument,
  questionId: string,
): number => session.questionSequence.indexOf(questionId);

export const assertValidOptionIndex = (
  optionIndex: number,
  totalOptions: number,
  questionId: string,
): void => {
  if (optionIndex < 0 || optionIndex >= totalOptions) {
    throw new QuizEngineError(
      `Invalid option index ${optionIndex} for question: ${questionId}`,
      ErrorCodes.INVALID_OPTION,
      400,
    );
  }
};

export const assertNavigationAllowed = (
  config: QuizConfig,
  session: SessionDocument,
  targetQuestionIndex: number,
): void => {
  const currentIndex = session.currentQuestionIndex;

  if (targetQuestionIndex === currentIndex) {
    return;
  }

  if (config.allowed_jumpNavigation) {
    return;
  }

  if (config.allowed_previousNavigation && targetQuestionIndex < currentIndex) {
    return;
  }

  if (targetQuestionIndex === currentIndex + 1) {
    return;
  }

  throw new QuizEngineError(
    'Navigation to this question is not allowed',
    ErrorCodes.NAVIGATION_DENIED,
    403,
  );
};

export const assertReAttemptAllowed = (
  config: QuizConfig,
  hasExistingAttempt: boolean,
): void => {
  if (hasExistingAttempt && !config.allowed_reAttempt) {
    throw new QuizEngineError(
      'Re-attempt is not allowed for this session',
      ErrorCodes.REATTEMPT_DENIED,
      403,
    );
  }
};

export const computeNextQuestionIndex = (
  session: SessionDocument,
  submittedQuestionIndex: number,
): number => {
  const maxIndex = session.questionSequence.length - 1;

  if (submittedQuestionIndex >= maxIndex) {
    return maxIndex;
  }

  return Math.max(session.currentQuestionIndex, submittedQuestionIndex + 1);
};

export const isSessionComplete = (
  session: SessionDocument,
  attemptCount: number,
): boolean => attemptCount >= session.questionSequence.length;
