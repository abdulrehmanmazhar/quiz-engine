import type { ResultDocument } from '../../../types/result.js';
import type { ResultStorage } from '../../types.js';
import { ResultModel } from '../models/result.model.js';

export const createResultRepository = (): ResultStorage => ({
  async createResult(result: ResultDocument): Promise<ResultDocument> {
    const created = await ResultModel.create(result);
    return created.toObject();
  },

  async findResultBySessionId(sessionId: string): Promise<ResultDocument | null> {
    const doc = await ResultModel.findOne({ sessionId }).lean();
    return doc ? (doc as ResultDocument) : null;
  },
});
