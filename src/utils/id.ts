import { nanoid } from 'nanoid';

export const generateSessionId = (): string => nanoid(21);
export const generateAttemptId = (): string => nanoid(21);
