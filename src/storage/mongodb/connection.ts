import mongoose from 'mongoose';
import type { Logger } from '../../utils/logger.js';

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectMongo = async (mongoUri: string, logger?: Logger): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });
  }

  await connectionPromise;
  logger?.info({ mongoUri: mongoUri.replace(/\/\/.*@/, '//***@') }, 'MongoDB connected');
};

export const disconnectMongo = async (logger?: Logger): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  connectionPromise = null;
  logger?.info('MongoDB disconnected');
};

export const isMongoConnected = (): boolean => mongoose.connection.readyState === 1;
