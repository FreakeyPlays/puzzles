use serde::Serialize;
use sudoku_core::{
    generate as core_generate, hint as core_hint, solve as core_solve, validate as core_validate,
};
use ts_rs::TS;
use wasm_bindgen::prelude::*;

#[derive(Serialize, TS)]
#[ts(export)]
pub struct GenerateResult {
    pub puzzle: String,
    pub solution: String,
    pub difficulty: String,
    pub seed: u32,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct ValidateResult {
    pub valid: bool,
    pub solved: bool,
    pub conflicts: Vec<u8>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct HintResult {
    pub index: u8,
    pub value: u8,
    pub technique: String,
}

#[wasm_bindgen]
pub fn generate(difficulty: Option<String>, seed: Option<u32>) -> Result<JsValue, JsError> {
    let difficulty_str = difficulty.as_deref().unwrap_or("medium");
    if !["easy", "medium", "hard", "extreme"].contains(&difficulty_str) {
        return Err(JsError::new(&format!(
            "Invalid difficulty: {difficulty_str}"
        )));
    }
    let result = core_generate(difficulty_str, seed);
    let out = GenerateResult {
        puzzle: result.puzzle,
        solution: result.solution,
        difficulty: result.difficulty,
        seed: result.seed,
    };
    Ok(serde_wasm_bindgen::to_value(&out)?)
}

#[wasm_bindgen]
pub fn solve(board: &str) -> Result<Option<String>, JsError> {
    if board.len() != 81 {
        return Err(JsError::new("Board must be exactly 81 characters"));
    }
    Ok(core_solve(board))
}

#[wasm_bindgen]
pub fn validate(board: &str) -> Result<JsValue, JsError> {
    if board.len() != 81 {
        return Err(JsError::new("Board must be exactly 81 characters"));
    }
    let result = core_validate(board);
    let out = ValidateResult {
        valid: result.valid,
        solved: result.solved,
        conflicts: result.conflicts,
    };
    Ok(serde_wasm_bindgen::to_value(&out)?)
}

#[wasm_bindgen]
pub fn hint(board: &str) -> Result<Option<JsValue>, JsError> {
    if board.len() != 81 {
        return Err(JsError::new("Board must be exactly 81 characters"));
    }
    Ok(core_hint(board).map(|h| {
        let out = HintResult {
            index: h.index,
            value: h.value,
            technique: h.technique,
        };
        serde_wasm_bindgen::to_value(&out).unwrap()
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn solve_rejects_short_board() {
        let result = solve("too_short");
        assert!(result.is_err());
    }
}
