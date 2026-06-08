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

// Hardcoded puzzle used until the real solver/generator is implemented.
const STUB_PUZZLE: &str =
    "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const STUB_SOLUTION: &str =
    "534678912672195348198342567859761423426853791713924856961537284287419635345286179";

pub fn generate(difficulty: &str, _seed: Option<u32>) -> GenerateResult {
    GenerateResult {
        puzzle: STUB_PUZZLE.to_string(),
        solution: STUB_SOLUTION.to_string(),
        difficulty: difficulty.to_string(),
        seed: 42,
    }
}

pub fn solve(board: &str) -> Option<String> {
    // Return the solution only when given the matching stub puzzle so that
    // the boot-sequence restore path works correctly. For other boards (e.g.
    // a board the real solver hasn't seen) return None.
    if board == STUB_PUZZLE {
        Some(STUB_SOLUTION.to_string())
    } else {
        None
    }
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
