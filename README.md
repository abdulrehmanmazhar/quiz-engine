# @figgo/quiz-engine

Transport-agnostic quiz assessment engine for managing sessions, timing, navigation, scoring, and results.

The engine handles **assessment logic only**. It never stores question content, user accounts, subscriptions, or business rules.

## Features

- Session creation with configurable timing and navigation rules
- Server-authoritative question and session expiry (UTC)
- Answer validation with question signature verification
- Real-time performance stats (optional)
- Negative marking support
- MongoDB persistence with indexed collections
- HTTP (Express) and IPC transports sharing the same core
- Strict TypeScript, Zod validation, Pino logging

## Installation

```bash
npm install @figgo/quiz-engine
```

### Peer requirements

- Node.js 18+
- MongoDB 6+

## Quick Start

### HTTP mode (Express server)

```ts
import { QuizEngine } from '@figgo/quiz-engine';

const engine = new QuizEngine({
  mode: 'http',
  mongoUri: process.env.MONGO_URI!,
  serverUrl: '0.0.0.0:4000',
});

await engine.start();
```

### IPC mode (Electron, offline desktop, embedded Node)

```ts
import { QuizEngine } from '@figgo/quiz-engine';

const engine = new QuizEngine({
  mode: 'ipc',
  mongoUri: process.env.MONGO_URI!,
});

await engine.connect();

const { createSession, syncSession, submitAttempt, getSessionResult } =
  engine.getIpcHandlers();

const session = await createSession({
  config: quizConfig,
  questions: sessionQuestions,
});
```

## API

### Create session

**HTTP:** `POST /session/create`

```json
{
  "config": {
    "allowed_sessionTime": true,
    "sessionTimeValue": 3600,
    "allowed_questionTime": true,
    "questionTimeValue": 60,
    "allowed_reAttempt": false,
    "allowed_earlyQuit": false,
    "allowed_questionExplanation": false,
    "allowed_previousNavigation": false,
    "allowed_jumpNavigation": false,
    "allowed_negativeMarking": false,
    "negativeMarkValue": 0,
    "markPerQuestion": 4,
    "allowed_realTimePerformance": true
  },
  "questions": [
    {
      "questionId": "q-1",
      "correctOptionIndex": 2,
      "totalOptions": 4,
      "questionSignature": "hmac-or-hash-from-host-app"
    }
  ]
}
```

**Response:**

```json
{
  "sessionId": "V1StGXR8_Z5jdHi6B-myT",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "expiresAt": "2025-01-01T01:00:00.000Z"
}
```

### Sync session

**HTTP:** `POST /session/sync`

```json
{ "sessionId": "V1StGXR8_Z5jdHi6B-myT" }
```

Returns authoritative `questionSequence`, `questionTimers`, and current progress.

### Submit attempt

**HTTP:** `POST /attempt`

```json
{
  "sessionId": "V1StGXR8_Z5jdHi6B-myT",
  "questionId": "q-1",
  "optionIndex": 2,
  "questionSignature": "hmac-or-hash-from-host-app"
}
```

When `allowed_realTimePerformance` is enabled, the response includes live score stats.

### Get result

**HTTP:** `GET /result/:sessionId`

Returns final scoring breakdown after session completion.

## Core-only usage

Use core functions directly when embedding in a custom transport:

```ts
import {
  createMongoStorage,
  createSession,
  syncSession,
  submitAttempt,
  getSessionResult,
  createLogger,
} from '@figgo/quiz-engine';

const storage = createMongoStorage(process.env.MONGO_URI!, createLogger());
await storage.connect();

const deps = { storage, logger: createLogger() };
const session = await createSession(deps, { config, questions });
```

## Security

- Never trust client timers — all expiry checks use server UTC time
- Question signatures are validated on every submission
- All payloads are validated with Zod
- Session and attempt IDs use cryptographically secure nanoid

## Development

```bash
npm install
npm run build
npm test
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for layered design, data models, and transport boundaries.

## License

MIT
