use wasm_bindgen::prelude::*;

// JavaScriptのコンソールにログを出力するためのインターフェース
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// JavaScript側から呼び出し可能な関数
#[wasm_bindgen]
pub fn hello_wasm() -> String {
    log("Hello Wasm from Rust!");
    "Hello Wasm".to_string()
}

// 初期化時に実行される関数
#[wasm_bindgen(start)]
pub fn main_js() {
    log("Rust WebAssembly module initialized");
}
