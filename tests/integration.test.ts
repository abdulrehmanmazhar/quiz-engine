import { describe, it, expect } from 'vitest';
import { createLogger } from '../src/utils/logger.js';
import {
  createSession,
  syncSession,
  submitAttempt,
  getSessionResult,
} from '../src/core/index.js';
import { QuizEngineError } from '../src/utils/errors.js';
import { getTestStorage, setupTestDb } from './helpers/setup.js';
import { baseConfig, sampleQuestions } from './helpers/fixtures.js';

setupTestDb();

describe('Integration: session lifecycle', () => {
  it('creates, syncs, submits, and completes a session', async () => {
    const storage = await getTestStorage();
    const logger = createLogger('test');
    const deps = { storage, logger };

    const created = await createSession(deps, {
      config: baseConfig,
      questions: sampleQuestions,
    });

    expect(created.sessionId).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
    expect(created.expiresAt).toBeTruthy();

    const synced = await syncSession(deps, created.sessionId);
    expect(synced.sessionId).toBe(created.sessionId);
    expect(synced.currentQuestionIndex).toBe(0);
    expect(synced.questionSequence).toEqual(['q-1', 'q-2', 'q-3']);
    expect(synced.questionTimers).toHaveLength(3);
    expect(synced.status).toBe('active');

    const attempt1 = await submitAttempt(deps, {
      sessionId: created.sessionId,
      questionId: 'q-1',
      optionIndex: 0,
      questionSignature: 'sig-1',
    });

    expect(attempt1.accepted).toBe(true);
    expect(attempt1.isCorrect).toBe(true);
    expect(attempt1.currentQuestionIndex).toBe(1);
    expect(attempt1.performance?.correct).toBe(1);

    const attempt2 = await submitAttempt(deps, {
      sessionId: created.sessionId,
      questionId: 'q-2',
      optionIndex: 1,
      questionSignature: 'sig-2',
    });

    expect(attempt2.isCorrect).toBe(false);
    expect(attempt2.performance?.incorrect).toBe(1);

    const attempt3 = await submitAttempt(deps, {
      sessionId: created.sessionId,
      questionId: 'q-3',
      optionIndex: 0,
      questionSignature: 'sig-3',
    });

    expect(attempt3.sessionStatus).toBe('completed');

    const result = await getSessionResult(deps, created.sessionId);
    expect(result.totalQuestions).toBe(3);
    expect(result.attempted).toBe(3);
    expect(result.correct).toBe(2);
    expect(result.incorrect).toBe(1);
    expect(result.score).toBe(8);
    expect(result.completedAt).toBeTruthy();
  });

  it('rejects invalid signature', async () => {
    const storage = await getTestStorage();
    const logger = createLogger('test');
    const deps = { storage, logger };

    const created = await createSession(deps, {
      config: baseConfig,
      questions: sampleQuestions,
    });

    await expect(
      submitAttempt(deps, {
        sessionId: created.sessionId,
        questionId: 'q-1',
        optionIndex: 0,
        questionSignature: 'wrong-sig',
      }),
    ).rejects.toThrow(QuizEngineError);
  });

  it('rejects re-attempt when not allowed', async () => {
    const storage = await getTestStorage();
    const logger = createLogger('test');
    const deps = { storage, logger };

    const created = await createSession(deps, {
      config: baseConfig,
      questions: sampleQuestions,
    });

    await submitAttempt(deps, {
      sessionId: created.sessionId,
      questionId: 'q-1',
      optionIndex: 0,
      questionSignature: 'sig-1',
    });

    await expect(
      submitAttempt(deps, {
        sessionId: created.sessionId,
        questionId: 'q-1',
        optionIndex: 1,
        questionSignature: 'sig-1',
      }),
    ).rejects.toThrow(QuizEngineError);
  });

  it('marks session expired on sync when session time elapsed', async () => {
    const storage = await getTestStorage();
    const logger = createLogger('test');
    const deps = { storage, logger };

    const created = await createSession(deps, {
      config: {
        ...baseConfig,
        allowed_sessionTime: true,
        sessionTimeValue: 1,
        allowed_questionTime: false,
      },
      questions: sampleQuestions,
    });

    await new Promise((resolve) => setTimeout(resolve, 1100));

    const synced = await syncSession(deps, created.sessionId);
    expect(synced.status).toBe('expired');
  });
});

describe('Integration: negative marking session', () => {
  it('applies negative marking in final result', async () => {
    const storage = await getTestStorage();
    const logger = createLogger('test');
    const deps = { storage, logger };

    const config = {
      ...baseConfig,
      allowed_negativeMarking: true,
      negativeMarkValue: 1,
      allowed_realTimePerformance: false,
    };

    const created = await createSession(deps, {
      config,
      questions: sampleQuestions,
    });

    await submitAttempt(deps, {
      sessionId: created.sessionId,
      questionId: 'q-1',
      optionIndex: 0,
      questionSignature: 'sig-1',
    });

    await submitAttempt(deps, {
      sessionId: created.sessionId,
      questionId: 'q-2',
      optionIndex: 1,
      questionSignature: 'sig-2',
    });

    await submitAttempt(deps, {
      sessionId: created.sessionId,
      questionId: 'q-3',
      optionIndex: 1,
      questionSignature: 'sig-3',
    });

    const result = await getSessionResult(deps, created.sessionId);
    expect(result.score).toBe(2);
    expect(result.correct).toBe(1);
    expect(result.incorrect).toBe(2);
  });
});
