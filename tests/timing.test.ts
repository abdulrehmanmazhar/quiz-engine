import { describe, it, expect } from 'vitest';
import {
  buildQuestionTimers,
  buildSessionExpiry,
  assertQuestionNotExpired,
} from '../src/core/validators/timing.validator.js';
import { QuizEngineError } from '../src/utils/errors.js';
import { isExpired } from '../src/utils/time.js';

describe('Timing', () => {
  const sessionStart = new Date('2025-01-01T00:00:00.000Z');

  it('builds question timers during session creation', () => {
    const sequence = ['q-1', 'q-2', 'q-3'];
    const timers = buildQuestionTimers(sequence, sessionStart, true, 60);

    expect(timers).toHaveLength(3);
    expect(timers[0]?.expiresAt).toBe('2025-01-01T00:01:00.000Z');
    expect(timers[1]?.expiresAt).toBe('2025-01-01T00:02:00.000Z');
    expect(timers[2]?.expiresAt).toBe('2025-01-01T00:03:00.000Z');
  });

  it('returns empty timers when question time is disabled', () => {
    const timers = buildQuestionTimers(['q-1'], sessionStart, false, 60);
    expect(timers).toEqual([]);
  });

  it('builds session expiry when session time is enabled', () => {
    const expiry = buildSessionExpiry(sessionStart, true, 3600);
    expect(expiry).toBe('2025-01-01T01:00:00.000Z');
  });

  it('returns undefined session expiry when disabled', () => {
    const expiry = buildSessionExpiry(sessionStart, false, 3600);
    expect(expiry).toBeUndefined();
  });

  it('rejects submissions after question expiry', () => {
    const timers = buildQuestionTimers(['q-1'], sessionStart, true, 60);
    const afterExpiry = new Date('2025-01-01T00:02:00.000Z');

    expect(() =>
      assertQuestionNotExpired(timers, 'q-1', afterExpiry),
    ).toThrow(QuizEngineError);
  });

  it('accepts submissions before question expiry', () => {
    const timers = buildQuestionTimers(['q-1'], sessionStart, true, 60);
    const beforeExpiry = new Date('2025-01-01T00:00:30.000Z');

    expect(() =>
      assertQuestionNotExpired(timers, 'q-1', beforeExpiry),
    ).not.toThrow();
  });

  it('detects expired timestamps', () => {
    expect(isExpired('2025-01-01T00:01:00.000Z', new Date('2025-01-01T00:02:00.000Z'))).toBe(true);
    expect(isExpired(undefined, new Date())).toBe(false);
  });
});
