use sudoku_core::factorial;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_factorial(num: u8) -> String {
    let mut f: u128 = 0;
    for _ in 0..10000000 {
        f = factorial(num as u128);
    }
    f.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn returns_factorial_as_string() {
        assert_eq!(get_factorial(0), "1");
        assert_eq!(get_factorial(1), "1");
        assert_eq!(get_factorial(5), "120");
        assert_eq!(get_factorial(10), "3628800");
    }
}
