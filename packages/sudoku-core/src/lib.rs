use rustoku_lib::{Difficulty, Rustoku, format_line, generate_board_by_difficulty};

pub struct GenerateResult {
    pub puzzle: String,
    pub solution: String,
    pub difficulty: String,
    pub seed: u32,
}

pub struct ValidateResult {
    pub valid: bool,
    pub solved: bool,
    pub conflicts: Vec<u8>,
}

pub struct HintResult {
    pub index: u8,
    pub value: u8,
    pub technique: String,
}

pub fn generate(difficulty: &str, _seed: Option<u32>) -> GenerateResult {
    let level = match difficulty {
        "easy" => Difficulty::Easy,
        "medium" => Difficulty::Medium,
        "hard" => Difficulty::Hard,
        "expert" => Difficulty::Expert,
        _ => Difficulty::Medium,
    };

    let board = generate_board_by_difficulty(level, 100).unwrap();
    let board_str = format_line(&board);
    let mut solver = Rustoku::new(board).unwrap();
    let solution = solver.solve_any().unwrap();
    let solution_str = format_line(&solution.board);

    GenerateResult {
        puzzle: board_str,
        solution: solution_str,
        difficulty: level.to_string(),
        seed: 0,
    }
}

pub fn solve(board: &str) -> Option<String> {
    let mut solver = Rustoku::new_from_str(board).ok()?;
    let solution = solver.solve_any()?;
    Some(format_line(&solution.board))
}

pub fn validate(_board: &str) -> ValidateResult {
    ValidateResult {
        valid: true,
        solved: false,
        conflicts: Vec::new(),
    }
}

pub fn hint(_board: &str) -> Option<HintResult> {
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    const STUB_PUZZLE: &str =
        "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
    const STUB_SOLUTION: &str =
        "534678912672195348198342567859761423426853791713924856961537284287419635345286179";

    #[test]
    fn generate_returns_valid_stub() {
        let r = generate("medium", None);
        assert_eq!(r.puzzle.len(), 81);
        assert_eq!(r.solution.len(), 81);
    }

    #[test]
    fn solve_returns_solution_for_stub_puzzle() {
        assert_eq!(solve(STUB_PUZZLE), Some(STUB_SOLUTION.to_string()));
    }

    #[test]
    fn solve_returns_none_for_unknown_board() {
        assert_eq!(solve(&"0".repeat(81)), None);
    }

    #[test]
    fn validate_stub() {
        let r = validate(STUB_PUZZLE);
        assert!(r.valid);
        assert!(r.conflicts.is_empty());
    }
}
