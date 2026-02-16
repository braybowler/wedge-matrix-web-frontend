# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT: After every code change, validate via running the custom command: `npm run check`**

## Commands

```bash
npm run dev              # Start Vite dev server
npm run build            # Type-check + production build
npm run test             # Run all tests (vitest run)
npx vitest run src/components/matrix/__tests__/matrix.spec.ts  # Run a single test file
npm run lint             # ESLint with auto-fix
npm run format           # Prettier format
npm run type-check       # vue-tsc type checking
npm run check            # Full local check (lint + format + type-check + test)
```

## Architecture

Vue 3 + TypeScript + Vite application for managing golf wedge yardage matrices. Uses Composition API throughout.

### Key Layers

- **Views** (`src/views/`): Page-level components, lazy-loaded by the router.
- **Components** (`src/components/`): Feature-grouped reusable components (login, register, matrix, configure, header).
- **Stores** (`src/stores/`): Pinia stores using composition API (function-style `defineStore`).
  - `userStore` — auth state + access token, persisted to localStorage.
  - `loadingStore` — global loading counter.
  - `matrixConfigurationStore` — wedge matrix state with a `requiresSync` flag for tracking unsaved changes.
- **Composables** (`src/composables/`): Reusable logic via Vue composition API.
  - `useAxios()` — typed HTTP wrapper around axios; auto-injects Bearer token and manages loading state.
  - `useValidation()` — form validation rules for email/password.
- **Router** (`src/router/index.ts`): Routes with `meta.requiresAuth` guarded by `beforeEach` that verifies/refreshes the token via `GET /user`.
- **Types** (`src/types/`): Shared TypeScript interfaces (`User`, `WedgeMatrix`, `YardageGrid`, etc.).
- **Plugins** (`src/plugins/axios.ts`): Global axios config (withCredentials, withXSRFToken, CSRF cookie/header names).

### Auth Flow

Login → API returns user + access_token → stored in userStore (+ localStorage) → matrix store initialized → redirect to `/matrix`. Protected route navigation triggers token verification via the router guard.

## Conventions

- **No semicolons**, single quotes, 100-char print width (Prettier).
- Path alias: `@/` maps to `src/`.
- Tests are colocated in `__tests__/` directories next to their source files.
- Tailwind CSS v4 with Vite plugin; component scoped styles use `@reference "tailwindcss"`.
- **File-level imports only** — never use inline dynamic `await import()`. All imports must be at the top of the file.
- `npm run check` must pass (lint + format + type-check + test + E2E testing) after every change.