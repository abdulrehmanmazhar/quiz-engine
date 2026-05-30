import { describe, it, expect } from 'vitest';
import { calculateScore } from '../src/utils/scoring.js';
import type { QuizConfig } from '../src/types/config.js';
import type { AttemptDocument } from '../src/types/attempt.js';
import { baseConfig } from './helpers/fixtures.js';

const makeAttempt = (
  questionId: string,
  isCorrect: boolean,
): AttemptDocument => ({
  attemptId: `a-${questionId}`,
  sessionId: 'session-1',
  questionId,
  optionIndex: isCorrect ? 0 : 1,
  questionSignature: 'sig',
  isCorrect,
  submittedAt: new Date().toISOString(),
});

describe('Scoring', () => {
  it('calculates positive marks for correct answers', () => {
    const attempts = [makeAttempt('q-1', true), makeAttempt('q-2', true)];
    const result = calculateScore(baseConfig, 3, attempts);

    expect(result.correct).toBe(2);
    expect(result.incorrect).toBe(0);
    expect(result.attempted).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.score).toBe(8);
    expect(result.percentage).toBeCloseTo(66.67, 1);
    expect(result.remaining).toBe(1);
  });

  it('applies negative marking when enabled', () => {
    const config: QuizConfig = {
      ...baseConfig,
      allowed_negativeMarking: true,
      negativeMarkValue: 1,
    };

    const attempts = [
      makeAttempt('q-1', true),
      makeAttempt('q-2', false),
      makeAttempt('q-3', false),
    ];

    const result = calculateScore(config, 3, attempts);

    expect(result.correct).toBe(1);
    expect(result.incorrect).toBe(2);
    expect(result.score).toBe(2);
    expect(result.percentage).toBeCloseTo(16.67, 1);
  });

  it('never returns negative total score', () => {
    const config: QuizConfig = {
      ...baseConfig,
      allowed_negativeMarking: true,
      negativeMarkValue: 10,
      markPerQuestion: 1,
    };

    const attempts = [makeAttempt('q-1', false), makeAttempt('q-2', false)];
    const result = calculateScore(config, 2, attempts);

    expect(result.score).toBe(0);
  });

  it('returns zero percentage when max score is zero', () => {
    const config: QuizConfig = { ...baseConfig, markPerQuestion: 0 };
    const result = calculateScore(config, 3, []);
    expect(result.percentage).toBe(0);
  });
});
