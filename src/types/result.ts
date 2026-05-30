export interface SessionResult {
  totalQuestions: number;
  attempted: number;
  skipped: number;
  correct: number;
  incorrect: number;
  score: number;
  percentage: number;
  startedAt: string;
  completedAt?: string;
}

export interface ResultDocument extends SessionResult {
  sessionId: string;
  createdAt: string;
}
