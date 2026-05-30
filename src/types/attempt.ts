export interface SubmitAttemptInput {
  sessionId: string;
  questionId: string;
  optionIndex: number;
  questionSignature: string;
}

export interface RealTimePerformance {
  score: number;
  correct: number;
  incorrect: number;
  remaining: number;
  percentage: number;
}

export interface SubmitAttemptResult {
  accepted: boolean;
  questionId: string;
  isCorrect: boolean;
  currentQuestionIndex: number;
  sessionStatus: 'active' | 'completed' | 'expired' | 'quit';
  performance?: RealTimePerformance;
}

export interface AttemptDocument {
  attemptId: string;
  sessionId: string;
  questionId: string;
  optionIndex: number;
  questionSignature: string;
  isCorrect: boolean;
  submittedAt: string;
}
