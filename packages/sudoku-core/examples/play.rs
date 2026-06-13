// A scratch "run me" file for poking at the library by hand.
//   cd packages/sudoku-core
//   cargo run --example play
// Edit freely — it is not part of the test suite or the published library.

use rustoku_lib::{Difficulty, format_line, generate_board_by_difficulty};

fn main() {
    // 1) Your library's public API (currently still the stub).
    let r = sudoku_core::generate("hard", None);
    println!("== sudoku_core::generate ==");
    println!("puzzle:   {}", r.puzzle);
    println!("solution: {}", r.solution);

    // 2) The real rustoku generator, straight from the dependency.
    println!("\n== rustoku generator ==");
    let board = generate_board_by_difficulty(Difficulty::Hard, 100).unwrap();
    println!("{board}"); // grid + "Line format: ..."
    println!("one-liner: {}", format_line(&board)); // just the 81 chars
}
