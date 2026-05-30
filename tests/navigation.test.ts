import { describe, it, expect } from 'vitest';
import {
  assertNavigationAllowed,
  assertReAttemptAllowed,
  computeNextQuestionIndex,
} from '../src/core/validators/navigation.validator.js';
import { QuizEngineError } from '../src/utils/errors.js';
import type { SessionDocument } from '../src/types/session.js';
import { baseConfig, sampleQuestions } from './helpers/fixtures.js';

const buildSession = (overrides: Partial<SessionDocument> = {}): SessionDocument => ({
  sessionId: 'session-1',
  config: baseConfig,
  questions: sampleQuestions.map((q, i) => ({ ...q, sequenceIndex: i })),
  questionSequence: sampleQuestions.map((q) => q.questionId),
  questionTimers: [],
  currentQuestionIndex: 0,
  status: 'active',
  createdAt: new Date().toISOString(),
  startedAt: new Date().toISOString(),
  ...overrides,
});

describe('Navigation rules', () => {
  it('allows submitting current question', () => {
    const session = buildSession({ currentQuestionIndex: 0 });
    expect(() =>
      assertNavigationAllowed(baseConfig, session, 0),
    ).not.toThrow();
  });

  it('allows next question in sequential mode', () => {
    const session = buildSession({ currentQuestionIndex: 0 });
    expect(() =>
      assertNavigationAllowed(baseConfig, session, 1),
    ).not.toThrow();
  });

  it('denies jumping ahead without jump navigation', () => {
    const session = buildSession({ currentQuestionIndex: 0 });
    expect(() =>
      assertNavigationAllowed(baseConfig, session, 2),
    ).toThrow(QuizEngineError);
  });

  it('allows jump navigation when enabled', () => {
    const config = { ...baseConfig, allowed_jumpNavigation: true };
    const session = buildSession({ config, currentQuestionIndex: 0 });
    expect(() =>
      assertNavigationAllowed(config, session, 2),
    ).not.toThrow();
  });

  it('allows previous navigation when enabled', () => {
    const config = { ...baseConfig, allowed_previousNavigation: true };
    const session = buildSession({ config, currentQuestionIndex: 2 });
    expect(() =>
      assertNavigationAllowed(config, session, 0),
    ).not.toThrow();
  });

  it('denies re-attempt when not allowed', () => {
    expect(() => assertReAttemptAllowed(baseConfig, true)).toThrow(QuizEngineError);
  });

  it('allows re-attempt when configured', () => {
    const config = { ...baseConfig, allowed_reAttempt: true };
    expect(() => assertReAttemptAllowed(config, true)).not.toThrow();
  });

  it('advances current question index after submission', () => {
    const session = buildSession({ currentQuestionIndex: 0 });
    expect(computeNextQuestionIndex(session, 0)).toBe(1);
    expect(computeNextQuestionIndex(session, 2)).toBe(2);
  });
});
