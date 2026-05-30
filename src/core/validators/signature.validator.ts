import { QuizEngineError, ErrorCodes } from '../../utils/errors.js';

export const assertSignatureMatches = (
  expected: string,
  provided: string,
  questionId: string,
): void => {
  if (expected !== provided) {
    throw new QuizEngineError(
      `Question signature mismatch for question: ${questionId}`,
      ErrorCodes.SIGNATURE_MISMATCH,
      403,
    );
  }
};
