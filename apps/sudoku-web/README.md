# sudoku-web

The Sudoku frontend — an installable [Angular](https://angular.dev) PWA. It
renders the board and game UI and calls into the Rust/WASM
[`@repo/sudoku-wasm`](../../packages/sudoku-wasm) package for puzzle logic.

## Development

```sh
bun dev --filter=sudoku-web    # dev server at http://localhost:4200
bun build --filter=sudoku-web  # production build into dist/
bun test --filter=sudoku-web   # unit tests (Vitest)
```

You can also use the Angular CLI directly (`ng serve`, `ng build`, `ng test`)
from this directory.
