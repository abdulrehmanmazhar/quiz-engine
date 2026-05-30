import type { SyncSessionResult, SessionDocument } from '../types/session.js';
import type { QuizStorage } from '../storage/types.js';
import type { Logger } from '../utils/logger.js';
import { nowUtc, isExpired, QuizEngineError, ErrorCodes } from '../utils/index.js';

export interface SyncSessionDeps {
  storage: QuizStorage;
  logger: Logger;
}

const requireSession = async (
  storage: QuizStorage,
  sessionId: string,
): Promise<SessionDocument> => {
  const session = await storage.findSessionById(sessionId);
  if (!session) {
    throw new QuizEngineError(
      `Session not found: ${sessionId}`,
      ErrorCodes.SESSION_NOT_FOUND,
      404,
    );
  }
  return session;
};

const resolveSessionStatus = async (
  storage: QuizStorage,
  session: SessionDocument,
  now: Date,
): Promise<SessionDocument> => {
  if (session.status !== 'active') {
    return session;
  }

  if (isExpired(session.expiresAt, now)) {
    await storage.markSessionExpired(session.sessionId);
    return { ...session, status: 'expired' };
  }

  return session;
};

const toSyncResult = (session: SessionDocument): SyncSessionResult => ({
  sessionId: session.sessionId,
  currentQuestionIndex: session.currentQuestionIndex,
  questionSequence: session.questionSequence,
  questionTimers: session.questionTimers,
  status: session.status,
  ...(session.expiresAt !== undefined ? { expiresAt: session.expiresAt } : {}),
});

export const syncSession = async (
  deps: SyncSessionDeps,
  sessionId: string,
): Promise<SyncSessionResult> => {
  const { storage } = deps;
  const rawSession = await requireSession(storage, sessionId);
  const session = await resolveSessionStatus(storage, rawSession, nowUtc());
  return toSyncResult(session);
};
