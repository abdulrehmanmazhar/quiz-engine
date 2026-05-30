import type { QuizConfig } from './config.js';

export type SessionStatus = 'active' | 'completed' | 'expired' | 'quit';

export interface SessionQuestion {
  questionId: string;
  correctOptionIndex: number;
  totalOptions: number;
  questionSignature: string;
}

export interface QuestionTimer {
  questionId: string;
  expiresAt: string;
}

export interface StoredQuestion extends SessionQuestion {
  sequenceIndex: number;
}

export interface CreateSessionInput {
  config: QuizConfig;
  questions: SessionQuestion[];
}

export interface CreateSessionResult {
  sessionId: string;
  createdAt: string;
  expiresAt?: string;
}

export interface SyncSessionResult {
  sessionId: string;
  currentQuestionIndex: number;
  questionSequence: string[];
  questionTimers: QuestionTimer[];
  expiresAt?: string;
  status: SessionStatus;
}

export interface SessionDocument {
  sessionId: string;
  config: QuizConfig;
  questions: StoredQuestion[];
  questionSequence: string[];
  questionTimers: QuestionTimer[];
  currentQuestionIndex: number;
  status: SessionStatus;
  createdAt: string;
  expiresAt?: string;
  startedAt: string;
  completedAt?: string;
}
