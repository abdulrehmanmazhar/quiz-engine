import express, { type Express } from 'express';
import type { Server } from 'node:http';
import type { Logger } from '../../utils/logger.js';
import type { QuizStorage } from '../../storage/types.js';
import { createHttpRouter } from './routes.js';
import { createErrorHandler } from './middleware/error-handler.js';

export interface HttpServerOptions {
  storage: QuizStorage;
  logger: Logger;
  serverUrl: string;
}

export interface HttpServer {
  app: Express;
  start(): Promise<Server>;
  stop(): Promise<void>;
}

const parseServerUrl = (serverUrl: string): { host: string; port: number } => {
  const normalized = serverUrl.startsWith('http') ? serverUrl : `http://${serverUrl}`;
  const url = new URL(normalized);
  const port = url.port ? parseInt(url.port, 10) : 4000;
  const host = url.hostname || '0.0.0.0';
  return { host, port };
};

export const createHttpServer = (options: HttpServerOptions): HttpServer => {
  const { storage, logger, serverUrl } = options;
  const app = express();
  let server: Server | null = null;

  app.use(express.json({ limit: '1mb' }));
  app.use(createHttpRouter({ storage, logger }));
  app.use(createErrorHandler(logger));

  return {
    app,

    async start(): Promise<Server> {
      const { host, port } = parseServerUrl(serverUrl);

      await new Promise<Server>((resolve, reject) => {
        server = app.listen(port, host, () => {
          logger.info({ host, port }, 'HTTP transport listening');
          resolve(server as Server);
        });
        server.on('error', reject);
      });

      return server as Server;
    },

    async stop(): Promise<void> {
      if (!server) return;

      await new Promise<void>((resolve, reject) => {
        server?.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      server = null;
    },
  };
};
