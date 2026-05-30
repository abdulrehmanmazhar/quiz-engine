import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { QuizEngine } from '../src/engine.js';
import { baseConfig, sampleQuestions } from './helpers/fixtures.js';
import { getSharedMongoUri } from './helpers/mongo-uri.js';

describe('HTTP transport', () => {
  let engine: QuizEngine | undefined;

  beforeAll(async () => {
    engine = new QuizEngine({
      mode: 'http',
      mongoUri: getSharedMongoUri(),
      serverUrl: '127.0.0.1:0',
    });
    await engine.start();
  }, 120000);

  afterAll(async () => {
    await engine?.stop();
  });

  it('POST /session/create creates a session', async () => {
    const app = engine!.getHttpApp();
    expect(app).toBeTruthy();

    const response = await request(app)
      .post('/session/create')
      .send({ config: baseConfig, questions: sampleQuestions })
      .expect(201);

    expect(response.body.sessionId).toBeTruthy();
    expect(response.body.createdAt).toBeTruthy();
  });

  it('POST /attempt submits an answer', async () => {
    const app = engine!.getHttpApp()!;

    const createRes = await request(app)
      .post('/session/create')
      .send({ config: baseConfig, questions: sampleQuestions });

    const sessionId = createRes.body.sessionId as string;

    const attemptRes = await request(app)
      .post('/attempt')
      .send({
        sessionId,
        questionId: 'q-1',
        optionIndex: 0,
        questionSignature: 'sig-1',
      })
      .expect(200);

    expect(attemptRes.body.accepted).toBe(true);
    expect(attemptRes.body.isCorrect).toBe(true);
  });

  it('GET /result/:sessionId returns session result', async () => {
    const app = engine!.getHttpApp()!;

    const createRes = await request(app)
      .post('/session/create')
      .send({
        config: { ...baseConfig, allowed_realTimePerformance: false },
        questions: sampleQuestions,
      });

    const sessionId = createRes.body.sessionId as string;

    for (const q of sampleQuestions) {
      await request(app)
        .post('/attempt')
        .send({
          sessionId,
          questionId: q.questionId,
          optionIndex: 0,
          questionSignature: q.questionSignature,
        });
    }

    const resultRes = await request(app)
      .get(`/result/${sessionId}`)
      .expect(200);

    expect(resultRes.body.totalQuestions).toBe(3);
    expect(resultRes.body.correct).toBe(3);
    expect(resultRes.body.score).toBe(12);
  });

  it('returns validation error for malformed payload', async () => {
    const app = engine!.getHttpApp()!;

    const response = await request(app)
      .post('/session/create')
      .send({ config: baseConfig, questions: [] })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('IPC transport', () => {
  let engine: QuizEngine | undefined;

  beforeAll(async () => {
    engine = new QuizEngine({
      mode: 'ipc',
      mongoUri: getSharedMongoUri(),
    });
    await engine.connect();
  }, 120000);

  afterAll(async () => {
    await engine?.stop();
  });

  it('exposes equivalent handlers to HTTP', async () => {
    const handlers = engine!.getIpcHandlers();

    const created = await handlers.createSession({
      config: baseConfig,
      questions: sampleQuestions,
    });

    const synced = await handlers.syncSession(created.sessionId);
    expect(synced.questionSequence).toHaveLength(3);

    const attempt = await handlers.submitAttempt({
      sessionId: created.sessionId,
      questionId: 'q-1',
      optionIndex: 0,
      questionSignature: 'sig-1',
    });

    expect(attempt.accepted).toBe(true);
  });
});

describe('QuizEngine configuration', () => {
  it('requires serverUrl for http mode', () => {
    expect(
      () =>
        new QuizEngine({
          mode: 'http',
          mongoUri: 'mongodb://localhost:27017/test',
        }),
    ).toThrow();
  });
});
