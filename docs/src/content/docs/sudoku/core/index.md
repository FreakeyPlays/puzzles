---
title: Core Package
description: Overview of the sudoku-core and sudoku-wasm Rust packages
---

The Sudoku logic lives in two Rust packages:

| Package                | Purpose                                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| `packages/sudoku-core` | Pure Rust library — all game logic, no WASM dependency                      |
| `packages/sudoku-wasm` | Thin WASM bindings via `wasm-bindgen` — exposes `sudoku-core` to JavaScript |

## Architecture

```
sudoku-core (Rust lib)
    └── sudoku-wasm (cdylib + rlib)
            └── sudoku-web (Angular, via Web Worker)
```

`sudoku-core` never imports `wasm-bindgen`. All WASM-specific code lives in `sudoku-wasm/src/lib.rs`, keeping the core logic independently testable with `cargo test`.

## Internal Representation

The solver and generator work with **bitsets** internally. Each cell stores a `u16` where bits 1–9 indicate candidate values. This allows fast constraint propagation using bitwise operations.

The public WASM API accepts and returns boards as **81-character strings** (`'0'`–`'9'`, `'0'` = empty). Conversion between the string format and the internal bitset representation happens at the boundary of each WASM function call (O(81), negligible).

## Serialization

Complex return types use [`serde`](https://serde.rs) + [`serde-wasm-bindgen`](https://github.com/cloudflare/serde-wasm-bindgen) to serialize Rust structs directly into native JavaScript objects — no `JSON.parse` needed on the TypeScript side.

```toml
# sudoku-wasm/Cargo.toml
[dependencies]
sudoku-core = { path = "../sudoku-core" }
wasm-bindgen = "0.2"
serde = { version = "1", features = ["derive"] }
serde-wasm-bindgen = "0.6"
```
