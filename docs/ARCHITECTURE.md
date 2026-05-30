# Architecture

## Overview

`@figgo/quiz-engine` follows a strict layered architecture where **core business logic never depends on transport**.

```
┌─────────────────────────────────────────────┐
│              Host Application               │
│  (Next.js / Node / Electron / RN bridge)    │
└─────────────────┬───────────────────────────┘
                  │
     ┌────────────┴────────────┐
     │                         │
┌────▼─────┐            ┌──────▼─────┐
│   HTTP   │            │    IPC     │
│ Express  │            │  Handlers  │
└────┬─────┘            └──────┬─────┘
     │                         │
     └────────────┬────────────┘
                  │
         ┌────────▼────────┐
         │      Core       │
         │ create-session  │
         │ sync-session    │
         │ submit-attempt  │
         │ get-result      │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │     Storage     │
         │    (MongoDB)    │
         └─────────────────┘
```

## Layer responsibilities

### Core (`src/core/`)

Pure assessment logic. Accepts a storage adapter and logger. No Express, no IPC, no HTTP concerns.

| Module | Responsibility |
|--------|----------------|
| `create-session.ts` | Validates input, builds question sequence/timers, persists session |
| `sync-session.ts` | Returns authoritative session state; marks expired sessions |
| `submit-attempt.ts` | Validates signatures, timing, navigation; records attempts; completes sessions |
| `get-result.ts` | Computes or retrieves final scoring breakdown |
| `validators/` | Reusable validation for session, timing, navigation, signatures |

### Storage (`src/storage/`)

MongoDB implementation via Mongoose. Exposes a `QuizStorage` interface consumed by core.

**Collections:**

| Collection | Purpose | Key indexes |
|------------|---------|-------------|
| `sessions` | Session config, question metadata, timers, status | `sessionId`, `status`, `createdAt`, `expiresAt` |
| `attempts` | Per-question answer records | `sessionId`, `(sessionId, questionId)` unique |
| `results` | Final computed results | `sessionId`, `createdAt` |

The engine stores **question metadata only** — never question body text.

### Transports (`src/transports/`)

| Transport | Entry | Routes / Handlers |
|-----------|-------|-------------------|
| HTTP | `createHttpServer` | `POST /session/create`, `POST /session/sync`, `POST /attempt`, `GET /result/:sessionId` |
| IPC | `createIpcHandlers` | `createSession`, `syncSession`, `submitAttempt`, `getSessionResult` |

Both transports delegate to the same core functions. Zod schemas validate all inbound data.

### Schemas & Types

- `src/types/` — TypeScript interfaces
- `src/schemas/` — Zod runtime validation (shared by HTTP and IPC)

## Timing model

All timestamps are UTC ISO-8601 strings.

1. **Session expiry** — Set at creation when `allowed_sessionTime` is true: `createdAt + sessionTimeValue`.
2. **Question expiry** — Pre-calculated at creation when `allowed_questionTime` is true. Question at index `i` expires at `startedAt + (i + 1) * questionTimeValue`.
3. **Submission validation** — Every attempt checks current server time against both session and question expiry.

Client-side timers are advisory only.

## Navigation model

| Rule | Behavior |
|------|----------|
| Sequential (default) | Submit current question or next question only |
| `allowed_previousNavigation` | Can submit answers for earlier questions |
| `allowed_jumpNavigation` | Can submit any question in the sequence |
| `allowed_reAttempt` | Allows updating a previous attempt |

## Scoring model

```
score = max(0, correct * markPerQuestion - incorrect * negativeMarkValue)
percentage = (score / (totalQuestions * markPerQuestion)) * 100
```

When `allowed_realTimePerformance` is true, live stats are returned after each submission.

## Error handling

All core errors throw `QuizEngineError` with a machine-readable `code` and HTTP status. The HTTP transport maps these to JSON error responses via centralized middleware.

## Extension points

| Need | Approach |
|------|----------|
| Custom transport (WebSocket, gRPC) | Call core functions with your own routing |
| Different database | Implement `QuizStorage` interface |
| React Native | Use IPC handlers via a native bridge |
| Offline-first | IPC mode with local MongoDB |

## What the engine does NOT do

- User authentication or authorization
- Question content management
- Payment or subscription logic
- Subject/category organization
- UI rendering

These remain in the host application.
