# sudoku-core

The core Sudoku engine, written in Rust. Contains the pure puzzle logic
(solving, generation, validation) with no platform dependencies, so it can be
reused on any target. The browser consumes it through
[`sudoku-wasm`](../sudoku-wasm).

## Development

```sh
bun build --filter=sudoku-core   # cargo build --release
bun test --filter=sudoku-core    # cargo test
```

`cargo` works directly in this directory too.
