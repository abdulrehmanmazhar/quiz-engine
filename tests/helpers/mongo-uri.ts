import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const URI_FILE = join(process.cwd(), '.test-mongo-uri');

export const getSharedMongoUri = (): string => {
  if (!existsSync(URI_FILE)) {
    throw new Error('Shared MongoDB URI not found. Ensure globalSetup ran successfully.');
  }
  return readFileSync(URI_FILE, 'utf-8').trim();
};
