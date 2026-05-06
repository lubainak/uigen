# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator. Users describe a component in natural language, Claude generates the code, and the result renders instantly in a live preview — no files are written to disk. Authenticated users can save and revisit projects; anonymous users can generate freely without signing up.

An `ANTHROPIC_API_KEY` in `.env` is optional — without one, the app falls back to a `MockLanguageModel` that returns static responses so the UI remains functional.

## Commands

```bash
npm run dev          # Start Next.js dev server (Turbopack)
npm run dev:daemon   # Start dev server in background, logs → logs.txt
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all tests)
npm run test -- path/to/file.test.ts  # Run a single test file
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Reset SQLite database via Prisma
```

All Next.js scripts run with `NODE_OPTIONS='--require ./node-compat.cjs'` — this patches away Node.js 25+ globals (`localStorage`/`sessionStorage`) that break SSR when dependencies detect them and assume a browser environment. Do not remove it.

## Architecture

UIGen is a full-stack Next.js 15 (App Router) application that lets users generate React components via Claude, with a live preview.

**Tech stack:** React 19, TypeScript, Tailwind v4, Prisma + SQLite, Vercel AI SDK, Monaco Editor, Radix UI.

### Core Data Flow

1. User sends a message in the chat UI
2. `ChatContext` (`/src/lib/contexts/chat-context.tsx`) forwards it to `/api/chat`
3. The API route streams a response from Claude (Haiku 4.5 by default, with a `MockLanguageModel` fallback when no API key is set — see `/src/lib/provider.ts`)
4. Claude uses two tools to mutate the virtual file system:
   - `str_replace_editor` (`/src/lib/tools/str-replace.ts`) — create/view/edit files
   - `file_manager` (`/src/lib/tools/file-manager.ts`) — CRUD operations
5. `FileSystemContext` (`/src/lib/contexts/file-system-context.tsx`) receives tool results and updates the in-memory `VirtualFileSystem` (`/src/lib/file-system.ts`)
6. The Preview iframe (`/src/components/preview/PreviewFrame.tsx`) detects an entry point by checking in priority order: `/App.jsx`, `/App.tsx`, `/index.jsx`, `/index.tsx`, `/src/App.jsx`, `/src/App.tsx`, then falls back to the first `.jsx`/`.tsx` file. It transforms JSX via Babel standalone (`/src/lib/transform/jsx-transformer.ts`) and renders the component live
7. For authenticated users, project state (messages + serialized VFS) is saved to Prisma/SQLite via server actions in `/src/actions/`

### Virtual File System

`VirtualFileSystem` in `/src/lib/file-system.ts` is a Map-based in-memory abstraction — no actual disk I/O. It is serializable to JSON for persistence. Both contexts share a single VFS instance.

### AI / Prompt Layer

- System prompt lives in `/src/lib/prompts/generation.tsx`
- Prompt caching is enabled with `cacheControl: 'ephemeral'`
- Model selection and fallback logic is in `/src/lib/provider.ts`

### Authentication

JWT sessions via `/src/lib/auth.ts`, bcrypt password hashing. `JWT_SECRET` env var is optional (defaults to a dev key). Anonymous usage is supported; in-progress work is tracked in `sessionStorage` via `/src/lib/anon-work-tracker.ts` and associated with a user account on sign-up.

### Key Directories

| Path | Purpose |
|------|---------|
| `src/app/api/chat/` | Streaming chat API route (main AI entry point) |
| `src/lib/contexts/` | `ChatContext` and `FileSystemContext` |
| `src/lib/tools/` | AI tool definitions (`str_replace_editor`, `file_manager`) |
| `src/lib/transform/` | In-browser JSX → HTML transformation for preview |
| `src/lib/prompts/` | Claude system prompt |
| `src/actions/` | Server actions for Prisma project CRUD |
| `src/components/preview/` | Live preview iframe logic |
| `src/components/editor/` | Monaco-based code editor + file tree |
| `prisma/` | Schema and migrations |

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).
