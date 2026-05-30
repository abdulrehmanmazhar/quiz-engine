import { z } from 'zod';

export const quizConfigSchema = z.object({
  allowed_sessionTime: z.boolean(),
  sessionTimeValue: z.number().nonnegative(),

  allowed_questionTime: z.boolean(),
  questionTimeValue: z.number().nonnegative(),

  allowed_reAttempt: z.boolean(),
  allowed_earlyQuit: z.boolean(),

  allowed_questionExplanation: z.boolean(),

  allowed_previousNavigation: z.boolean(),
  allowed_jumpNavigation: z.boolean(),

  allowed_negativeMarking: z.boolean(),
  negativeMarkValue: z.number().nonnegative(),

  markPerQuestion: z.number().nonnegative(),

  allowed_realTimePerformance: z.boolean(),
});

export const sessionQuestionSchema = z.object({
  questionId: z.string().min(1),
  correctOptionIndex: z.number().int().nonnegative(),
  totalOptions: z.number().int().min(2),
  questionSignature: z.string().min(1),
}).refine(
  (q) => q.correctOptionIndex < q.totalOptions,
  { message: 'correctOptionIndex must be less than totalOptions' },
);

export const createSessionSchema = z.object({
  config: quizConfigSchema,
  questions: z.array(sessionQuestionSchema).min(1),
});

export const syncSessionSchema = z.object({
  sessionId: z.string().min(1),
});

export const submitAttemptSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  optionIndex: z.number().int().nonnegative(),
  questionSignature: z.string().min(1),
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().min(1),
});

export type QuizConfigInput = z.infer<typeof quizConfigSchema>;
export type SessionQuestionInput = z.infer<typeof sessionQuestionSchema>;
export type CreateSessionInputSchema = z.infer<typeof createSessionSchema>;
export type SubmitAttemptInputSchema = z.infer<typeof submitAttemptSchema>;
