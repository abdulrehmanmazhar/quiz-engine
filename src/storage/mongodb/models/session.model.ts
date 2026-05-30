import mongoose from 'mongoose';
import type { QuizConfig } from '../../../types/config.js';
import type { StoredQuestion, QuestionTimer, SessionStatus } from '../../../types/session.js';

export interface SessionMongoDoc {
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

const questionTimerSchema = new mongoose.Schema<QuestionTimer>(
  {
    questionId: { type: String, required: true },
    expiresAt: { type: String, required: true },
  },
  { _id: false },
);

const storedQuestionSchema = new mongoose.Schema<StoredQuestion>(
  {
    questionId: { type: String, required: true },
    correctOptionIndex: { type: Number, required: true },
    totalOptions: { type: Number, required: true },
    questionSignature: { type: String, required: true },
    sequenceIndex: { type: Number, required: true },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema<SessionMongoDoc>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    config: { type: mongoose.Schema.Types.Mixed, required: true },
    questions: { type: [storedQuestionSchema], required: true },
    questionSequence: { type: [String], required: true },
    questionTimers: { type: [questionTimerSchema], required: true },
    currentQuestionIndex: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'expired', 'quit'],
      index: true,
    },
    createdAt: { type: String, required: true, index: true },
    expiresAt: { type: String, index: true },
    startedAt: { type: String, required: true },
    completedAt: { type: String },
  },
  {
    collection: 'sessions',
    versionKey: false,
  },
);

sessionSchema.index({ status: 1, expiresAt: 1 });
sessionSchema.index({ createdAt: -1 });

export const SessionModel = mongoose.model<SessionMongoDoc>('Session', sessionSchema);
