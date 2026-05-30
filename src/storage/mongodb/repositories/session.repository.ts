import type { SessionDocument } from '../../../types/session.js';
import type { SessionStorage } from '../../types.js';
import { SessionModel } from '../models/session.model.js';

const toSessionDocument = (doc: SessionDocument): SessionDocument => {
  const result: SessionDocument = {
    sessionId: doc.sessionId,
    config: doc.config,
    questions: doc.questions,
    questionSequence: doc.questionSequence,
    questionTimers: doc.questionTimers,
    currentQuestionIndex: doc.currentQuestionIndex,
    status: doc.status,
    createdAt: doc.createdAt,
    startedAt: doc.startedAt,
  };

  if (doc.expiresAt !== undefined) {
    result.expiresAt = doc.expiresAt;
  }

  if (doc.completedAt !== undefined) {
    result.completedAt = doc.completedAt;
  }

  return result;
};

export const createSessionRepository = (): SessionStorage => ({
  async createSession(session: SessionDocument): Promise<SessionDocument> {
    const created = await SessionModel.create(session);
    return toSessionDocument(created.toObject());
  },

  async findSessionById(sessionId: string): Promise<SessionDocument | null> {
    const doc = await SessionModel.findOne({ sessionId }).lean();
    return doc ? toSessionDocument(doc as SessionDocument) : null;
  },

  async updateSession(
    sessionId: string,
    update: Partial<Pick<SessionDocument, 'currentQuestionIndex' | 'status' | 'completedAt'>>,
  ): Promise<SessionDocument | null> {
    const doc = await SessionModel.findOneAndUpdate(
      { sessionId },
      { $set: update },
      { new: true },
    ).lean();

    return doc ? toSessionDocument(doc as SessionDocument) : null;
  },

  async markSessionExpired(sessionId: string): Promise<void> {
    await SessionModel.updateOne(
      { sessionId, status: 'active' },
      { $set: { status: 'expired' } },
    );
  },
});
