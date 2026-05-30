import type { AttemptDocument } from '../../../types/attempt.js';
import type { AttemptStorage } from '../../types.js';
import { AttemptModel } from '../models/attempt.model.js';

export const createAttemptRepository = (): AttemptStorage => ({
  async createAttempt(attempt: AttemptDocument): Promise<AttemptDocument> {
    const created = await AttemptModel.create(attempt);
    return created.toObject();
  },

  async updateAttempt(
    sessionId: string,
    questionId: string,
    update: Pick<AttemptDocument, 'optionIndex' | 'questionSignature' | 'isCorrect' | 'submittedAt'>,
  ): Promise<AttemptDocument | null> {
    const doc = await AttemptModel.findOneAndUpdate(
      { sessionId, questionId },
      { $set: update },
      { new: true },
    ).lean();

    return doc ? (doc as AttemptDocument) : null;
  },

  async findAttemptsBySessionId(sessionId: string): Promise<AttemptDocument[]> {
    const docs = await AttemptModel.find({ sessionId }).sort({ submittedAt: 1 }).lean();
    return docs as AttemptDocument[];
  },

  async findAttemptBySessionAndQuestion(
    sessionId: string,
    questionId: string,
  ): Promise<AttemptDocument | null> {
    const doc = await AttemptModel.findOne({ sessionId, questionId }).lean();
    return doc ? (doc as AttemptDocument) : null;
  },
});
