import type { QuizConfig } from '../../src/types/config.js';
import type { SessionQuestion } from '../../src/types/session.js';

export const baseConfig: QuizConfig = {
  allowed_sessionTime: true,
  sessionTimeValue: 3600,
  allowed_questionTime: true,
  questionTimeValue: 60,
  allowed_reAttempt: false,
  allowed_earlyQuit: false,
  allowed_questionExplanation: false,
  allowed_previousNavigation: false,
  allowed_jumpNavigation: false,
  allowed_negativeMarking: false,
  negativeMarkValue: 0,
  markPerQuestion: 4,
  allowed_realTimePerformance: true,
};

export const createQuestions = (count: number): SessionQuestion[] =>
  Array.from({ length: count }, (_, i) => ({
    questionId: `q-${i + 1}`,
    correctOptionIndex: 0,
    totalOptions: 4,
    questionSignature: `sig-${i + 1}`,
  }));

export const sampleQuestions: SessionQuestion[] = createQuestions(3);
