export const nowUtc = (): Date => new Date();

export const toUtcIsoString = (date: Date): string => date.toISOString();

export const addSecondsUtc = (date: Date, seconds: number): Date =>
  new Date(date.getTime() + seconds * 1000);

export const isExpired = (expiresAt: string | undefined, reference: Date = nowUtc()): boolean => {
  if (!expiresAt) return false;
  return reference.getTime() >= new Date(expiresAt).getTime();
};

export const parseUtcIso = (iso: string): Date => new Date(iso);
