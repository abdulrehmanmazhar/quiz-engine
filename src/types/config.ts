export interface QuizConfig {
  allowed_sessionTime: boolean;
  sessionTimeValue: number;

  allowed_questionTime: boolean;
  questionTimeValue: number;

  allowed_reAttempt: boolean;
  allowed_earlyQuit: boolean;

  allowed_questionExplanation: boolean;

  allowed_previousNavigation: boolean;
  allowed_jumpNavigation: boolean;

  allowed_negativeMarking: boolean;
  negativeMarkValue: number;

  markPerQuestion: number;

  allowed_realTimePerformance: boolean;
}
