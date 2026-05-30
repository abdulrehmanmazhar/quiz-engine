import type { SessionDocument, SessionStatus } from '../types/session.js';
import type { AttemptDocument } from '../types/attempt.js';
import type { ResultDocument } from '../types/result.js';

export interface SessionStorage {
  createSession(session: SessionDocument): Promise<SessionDocument>;
  findSessionById(sessionId: string): Promise<SessionDocument | null>;
  updateSession(
    sessionId: string,
    update: Partial<Pick<SessionDocument, 'currentQuestionIndex' | 'status' | 'completedAt'>>,
  ): Promise<SessionDocument | null>;
  markSessionExpired(sessionId: string): Promise<void>;
}

export interface AttemptStorage {
  createAttempt(attempt: AttemptDocument): Promise<AttemptDocument>;
  updateAttempt(
    sessionId: string,
    questionId: string,
    update: Pick<AttemptDocument, 'optionIndex' | 'questionSignature' | 'isCorrect' | 'submittedAt'>,
  ): Promise<AttemptDocument | null>;
  findAttemptsBySessionId(sessionId: string): Promise<AttemptDocument[]>;
  findAttemptBySessionAndQuestion(
    sessionId: string,
    questionId: string,
  ): Promise<AttemptDocument | null>;
}

export interface ResultStorage {
  createResult(result: ResultDocument): Promise<ResultDocument>;
  findResultBySessionId(sessionId: string): Promise<ResultDocument | null>;
}

export interface QuizStorage extends SessionStorage, AttemptStorage, ResultStorage {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export type { SessionDocument, SessionStatus, AttemptDocument, ResultDocument };
