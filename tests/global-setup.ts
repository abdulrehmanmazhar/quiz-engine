import type { MongoMemoryServer } from 'mongodb-memory-server';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const URI_FILE = join(process.cwd(), '.test-mongo-uri');

export default async function globalSetup(): Promise<() => Promise<void>> {
  const { MongoMemoryServer: MongoMemoryServerClass } = await import('mongodb-memory-server');

  const mongoServer: MongoMemoryServer = await MongoMemoryServerClass.create({
    binary: {
      version: '7.0.14',
    },
  });

  const uri = mongoServer.getUri();
  writeFileSync(URI_FILE, uri, 'utf-8');

  return async () => {
    await mongoServer.stop();
  };
}
