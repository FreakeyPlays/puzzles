---
title: Architecture
description: Angular module structure, folder layout and component patterns for sudoku-web
---

## Approach

`sudoku-web` uses Angular 22 **standalone components** — no NgModules anywhere in the app. All state is managed with **Signals**; RxJS is not used for application state.

## Folder Structure

```
src/app/
  core/
    models/           ← shared TypeScript interfaces and types
    services/         ← singleton services with no UI
    workers/          ← Web Worker source + internal protocol types
    guards/           ← functional route guards
  pages/              ← one subfolder per route
    home/
    game/
      board/
      input-pad/
    history/
    settings/
  shared/             ← UI components used across two or more pages
    modal/
    bottom-nav/
```

### Folder rules

| Folder           | Rule                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| `core/models/`   | TypeScript interfaces and types meaningful to the whole app                   |
| `core/services/` | Singleton services — no UI, no templates, used app-wide                       |
| `core/workers/`  | Web Worker source files and their internal protocol types                     |
| `core/guards/`   | Functional route guards                                                       |
| `pages/`         | One subfolder per route. Components that only appear in that route live here. |
| `shared/`        | Has a template. Used by **two or more** page folders.                         |

If a component is only used within one page, it stays in that page's folder regardless of how reusable it might feel.

## Component Pattern

Components inject services directly using `inject()`. Service-provided state is not threaded down via `@Input()`.

`@Input()` is reserved for truly reusable components that receive data from their parent — for example `BoardComponent` receives the board strings from `GameComponent`, not from a service.

```typescript
// GameComponent — injects services directly
export class GameComponent {
  protected readonly game = inject(GameService);
  protected readonly app = inject(AppService);
}

// BoardComponent — receives data from its parent via @Input
export class BoardComponent {
  @Input({ required: true }) puzzle!: string;
  @Input({ required: true }) edits!: string;
}
```

Components derive computed values locally from signals rather than expecting the service to pre-compute everything:

```typescript
// In HomeComponent — derived locally, not exposed by AppService
protected readonly hasActiveGame = computed(() => this.app.phase() !== 'idle');
```

## Routing

| Route       | Guard       | Notes                                      |
| ----------- | ----------- | ------------------------------------------ |
| `/home`     | —           | Entry point on every app open              |
| `/game`     | `gameGuard` | Redirects to `/home` if `phase === 'idle'` |
| `/history`  | —           | Placeholder                                |
| `/settings` | —           | Placeholder                                |

`gameGuard` lives in `core/guards/game.guard.ts`. It allows `loading`, `playing`, and `paused` through and redirects `idle` to `/home`. This prevents the Game screen from rendering when there is no active puzzle.

Navigation is always handled by components, not services. A service method changes phase; the component that called it then calls `router.navigate()`.
