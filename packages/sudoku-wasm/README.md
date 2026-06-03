# sudoku-wasm

WebAssembly bindings that expose [`sudoku-core`](../sudoku-core) to
JavaScript. Built with [`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen)
and [`wasm-pack`](https://rustwasm.github.io/wasm-pack/); the generated `pkg/`
is imported by the [`sudoku-web`](../../apps/sudoku-web) app.

## Development

```sh
bun build --filter=sudoku-wasm   # release build into pkg/
bun dev --filter=sudoku-wasm     # dev build
bun test --filter=sudoku-wasm    # cargo test
```
