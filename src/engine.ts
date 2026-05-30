import type { Server } from 'node:http';
import type { QuizEngineConfig, IpcHandlers } from './types/engine.js';
import type { Express } from 'express';
import { createLogger, QuizEngineError, ErrorCodes } from './utils/index.js';
import { createMongoStorage } from './storage/mongodb/index.js';
import type { QuizStorage } from './storage/types.js';
import { createHttpServer } from './transports/http/server.js';
import { createIpcHandlers } from './transports/ipc/handlers.js';

export class QuizEngine {
  private readonly config: QuizEngineConfig;
  private readonly logger = createLogger('quiz-engine');
  private readonly storage: QuizStorage;
  private httpServer: ReturnType<typeof createHttpServer> | null = null;
  private ipcHandlers: IpcHandlers | null = null;
  private connected = false;

  constructor(config: QuizEngineConfig) {
    this.validateConfig(config);
    this.config = config;
    this.storage = createMongoStorage(config.mongoUri, this.logger);
  }

  private validateConfig(config: QuizEngineConfig): void {
    if (!config.mode) {
      throw new QuizEngineError(
        'mode is required',
        ErrorCodes.VALIDATION_ERROR,
        400,
      );
    }

    if (!config.mongoUri) {
      throw new QuizEngineError(
        'mongoUri is required',
        ErrorCodes.VALIDATION_ERROR,
        400,
      );
    }

    if (config.mode === 'http' && !config.serverUrl) {
      throw new QuizEngineError(
        'serverUrl is required when mode is http',
        ErrorCodes.VALIDATION_ERROR,
        400,
      );
    }
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    await this.storage.connect();
    this.connected = true;

    if (this.config.mode === 'http') {
      this.httpServer = createHttpServer({
        storage: this.storage,
        logger: this.logger,
        serverUrl: this.config.serverUrl as string,
      });
    } else {
      this.ipcHandlers = createIpcHandlers({
        storage: this.storage,
        logger: this.logger,
      });
    }
  }

  async start(): Promise<Server | void> {
    await this.connect();

    if (this.config.mode === 'http' && this.httpServer) {
      return this.httpServer.start();
    }

    this.logger.info('IPC transport ready');
  }

  async stop(): Promise<void> {
    if (this.httpServer) {
      await this.httpServer.stop();
    }

    if (this.connected) {
      await this.storage.disconnect();
      this.connected = false;
    }
  }

  getStorage(): QuizStorage {
    return this.storage;
  }

  getHttpApp(): Express | null {
    return this.httpServer?.app ?? null;
  }

  getIpcHandlers(): IpcHandlers {
    if (this.config.mode !== 'ipc') {
      throw new QuizEngineError(
        'IPC handlers are only available when mode is ipc',
        ErrorCodes.VALIDATION_ERROR,
        400,
      );
    }

    if (!this.ipcHandlers) {
      this.ipcHandlers = createIpcHandlers({
        storage: this.storage,
        logger: this.logger,
      });
    }

    return this.ipcHandlers;
  }
}
