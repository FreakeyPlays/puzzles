use serde::{Deserialize, Serialize};
use strum::Display;
use sudoku_core::{
    generate as core_generate, hint as core_hint, solve as core_solve, validate as core_validate,
};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Tsify, Display, Clone, Copy)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "lowercase")]
#[strum(serialize_all = "lowercase")]
pub enum Difficulty {
    Easy,
    Medium,
    Hard,
    Extreme,
}

#[derive(Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct GenerateResult {
    pub puzzle: String,
    pub solution: String,
    pub difficulty: Difficulty,
    pub seed: u32,
}

#[derive(Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct ValidateResult {
    pub valid: bool,
    pub solved: bool,
    pub conflicts: Vec<u8>,
}

#[derive(Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct HintResult {
    pub index: u8,
    pub value: u8,
    pub technique: String,
}

#[wasm_bindgen]
pub fn generate(difficulty: Option<Difficulty>, seed: Option<u32>) -> Result<GenerateResult, JsError> {
    let d = difficulty.unwrap_or(Difficulty::Medium);
    let result = core_generate(&d.to_string(), seed);
    Ok(GenerateResult {
        puzzle: result.puzzle,
        solution: result.solution,
        difficulty: d,
        seed: result.seed,
    })
}

#[wasm_bindgen]
pub fn solve(board: &str) -> Result<Option<String>, JsError> {
    if board.len() != 81 {
        return Err(JsError::new("Board must be exactly 81 characters"));
    }
    Ok(core_solve(board))
}

#[wasm_bindgen]
pub fn validate(board: &str) -> Result<ValidateResult, JsError> {
    if board.len() != 81 {
        return Err(JsError::new("Board must be exactly 81 characters"));
    }
    let result = core_validate(board);
    Ok(ValidateResult {
        valid: result.valid,
        solved: result.solved,
        conflicts: result.conflicts,
    })
}

#[wasm_bindgen]
pub fn hint(board: &str) -> Result<Option<HintResult>, JsError> {
    if board.len() != 81 {
        return Err(JsError::new("Board must be exactly 81 characters"));
    }
    Ok(core_hint(board).map(|h| HintResult {
        index: h.index,
        value: h.value,
        technique: h.technique,
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
