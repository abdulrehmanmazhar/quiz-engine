import type { QuizConfig } from '../types/config.js';
import type { AttemptDocument } from '../types/attempt.js';

export interface ScoreBreakdown {
  correct: number;
  incorrect: number;
  attempted: number;
  skipped: number;
  score: number;
  percentage: number;
  remaining: number;
}

export const calculateScore = (
  config: QuizConfig,
  totalQuestions: number,
  attempts: AttemptDocument[],
): ScoreBreakdown => {
  const correct = attempts.filter((a) => a.isCorrect).length;
  const incorrect = attempts.filter((a) => !a.isCorrect).length;
  const attempted = attempts.length;
  const skipped = totalQuestions - attempted;

  const positiveMarks = correct * config.markPerQuestion;
  const negativeMarks = config.allowed_negativeMarking
    ? incorrect * config.negativeMarkValue
    : 0;

  const score = Math.max(0, positiveMarks - negativeMarks);
  const maxScore = totalQuestions * config.markPerQuestion;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0;
  const remaining = totalQuestions - attempted;

  return {
    correct,
    incorrect,
    attempted,
    skipped,
    score,
    percentage,
    remaining,
  };
};

export const toPerformance = (breakdown: ScoreBreakdown): {
  score: number;
  correct: number;
  incorrect: number;
  remaining: number;
  percentage: number;
} => ({
  score: breakdown.score,
  correct: breakdown.correct,
  incorrect: breakdown.incorrect,
  remaining: breakdown.remaining,
  percentage: breakdown.percentage,
});
