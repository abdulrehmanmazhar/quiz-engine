import mongoose from 'mongoose';
import { beforeEach, afterAll } from 'vitest';
import { createMongoStorage } from '../../src/storage/mongodb/index.js';
import type { QuizStorage } from '../../src/storage/types.js';
import { createLogger } from '../../src/utils/logger.js';
import { getSharedMongoUri } from './mongo-uri.js';

let sharedStorage: QuizStorage | null = null;

export const getTestStorage = async (): Promise<QuizStorage> => {
  if (!sharedStorage) {
    sharedStorage = createMongoStorage(getSharedMongoUri(), createLogger('test'));
    await sharedStorage.connect();
  }
  return sharedStorage;
};

export const setupTestDb = (): void => {
  beforeEach(async () => {
    await getTestStorage();
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    sharedStorage = null;
  });
};
