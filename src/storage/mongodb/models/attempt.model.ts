import mongoose from 'mongoose';

export interface AttemptMongoDoc {
  attemptId: string;
  sessionId: string;
  questionId: string;
  optionIndex: number;
  questionSignature: string;
  isCorrect: boolean;
  submittedAt: string;
}

const attemptSchema = new mongoose.Schema<AttemptMongoDoc>(
  {
    attemptId: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true, index: true },
    questionId: { type: String, required: true },
    optionIndex: { type: Number, required: true },
    questionSignature: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    submittedAt: { type: String, required: true },
  },
  {
    collection: 'attempts',
    versionKey: false,
  },
);

attemptSchema.index({ sessionId: 1, questionId: 1 }, { unique: true });
attemptSchema.index({ submittedAt: -1 });

export const AttemptModel = mongoose.model<AttemptMongoDoc>('Attempt', attemptSchema);
