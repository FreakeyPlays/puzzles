---
title: Screens & Navigation
description: Routes, navigation structure and screen responsibilities for sudoku-web
---

The app has four routes and a result overlay. Navigation is anchored by a persistent bottom tab bar.

## Routes

| Route | Tab | Description |
|---|---|---|
| `/home` | Home | Start screen — entry point on every app open |
| `/game` | — | Active puzzle — not a tab, entered from Home only |
| `/history` | History | List of past games (placeholder until SQLite) |
| `/settings` | Settings | Themes, accessibility, app preferences (placeholder) |

`/game` has no tab entry because it is always reached via an intentional action (Start Game or Continue), never by tapping a tab directly.

## Bottom Navigation

Three tabs are always visible:

```
[ Home ]  [ History ]  [ Settings ]
```

When the user is on `/game`, the tab bar remains visible. Tapping **Home** navigates to `/home` and pauses the active game.

## Home Screen

The start screen adapts based on the current App State:

| App State (`sudoku:app.phase`) | Button shown |
|---|---|
| `idle` | **Start Game** |
| `playing` | **Continue** + **New Game** |
| `paused` | **Continue** + **New Game** |

"Continue" and "New Game" are visually distinct — Continue is the primary action, New Game is secondary/destructive — so the user cannot accidentally discard a game.

### Start Game Flow

Pressing **Start Game** opens a modal for difficulty selection:

```
┌──────────────────────────────┐
│  Select Difficulty           │
│                              │
│  ○ Easy                      │
│  ● Medium   ← last used      │
│  ○ Hard                      │
│  ○ Extreme                   │
│                              │
│  [Cancel]        [Start]     │
└──────────────────────────────┘
```

The last selected difficulty is pre-selected. After pressing Start, the App State transitions to `loading` and `/game` is navigated to.

## Game Screen

The active puzzle. No separate route for each game — always `/game`.

The screen contains:
- The 9×9 Sudoku board
- A number input pad (1–9 + erase)
- A hint button
- A timer
- A "New Game" action (triggers confirmation before abandoning)

## Result Overlay

Shown on top of `/game` when the puzzle is solved. Not a separate route.

```
┌──────────────────────────────┐
│  Puzzle Solved!              │
│                              │
│  Time:        04:32          │
│  Difficulty:  Hard           │
│                              │
│  [New Game]        [Home]    │
└──────────────────────────────┘
```

Both actions mark the puzzle as `solved` before leaving. **New Game** transitions to `loading` for a new puzzle of the same difficulty. **Home** transitions the App State to `idle` and navigates to `/home`.

## History Screen

Lists past completed and abandoned games. Currently a placeholder — full implementation requires SQLite (see [Local Storage](./local-storage)).

## Settings Screen

Placeholder for future configuration: themes, accessibility options, game preferences.
