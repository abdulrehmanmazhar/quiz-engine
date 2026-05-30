export type EngineMode = 'http' | 'ipc';

export interface QuizEngineConfig {
  mode: EngineMode;
  mongoUri: string;
  serverUrl?: string;
}

export interface IpcHandlers {
  createSession: (input: import('./session.js').CreateSessionInput) => Promise<import('./session.js').CreateSessionResult>;
  syncSession: (sessionId: string) => Promise<import('./session.js').SyncSessionResult>;
  submitAttempt: (input: import('./attempt.js').SubmitAttemptInput) => Promise<import('./attempt.js').SubmitAttemptResult>;
  getSessionResult: (sessionId: string) => Promise<import('./result.js').SessionResult>;
}
