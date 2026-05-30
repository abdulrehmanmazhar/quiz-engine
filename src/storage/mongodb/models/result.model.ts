import mongoose from 'mongoose';

export interface ResultMongoDoc {
  sessionId: string;
  totalQuestions: number;
  attempted: number;
  skipped: number;
  correct: number;
  incorrect: number;
  score: number;
  percentage: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

const resultSchema = new mongoose.Schema<ResultMongoDoc>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    totalQuestions: { type: Number, required: true },
    attempted: { type: Number, required: true },
    skipped: { type: Number, required: true },
    correct: { type: Number, required: true },
    incorrect: { type: Number, required: true },
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    startedAt: { type: String, required: true },
    completedAt: { type: String },
    createdAt: { type: String, required: true, index: true },
  },
  {
    collection: 'results',
    versionKey: false,
  },
);

export const ResultModel = mongoose.model<ResultMongoDoc>('Result', resultSchema);
