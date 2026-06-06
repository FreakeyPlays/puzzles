export interface SudokuFunctions {
  get_factorial: { args: number; result: string };
}

export type SudokuFunctionName = keyof SudokuFunctions;

export interface SudokuCallResult<K extends SudokuFunctionName> {
  value: SudokuFunctions[K]['result'];
  durationMs: number;
}

export interface WasmInitMessage {
  type: 'init';
  wasmUrl: string;
}

export type WasmCallMessage = {
  [K in SudokuFunctionName]: {
    type: 'call';
    id: number;
    fn: K;
    args: SudokuFunctions[K]['args'];
  };
}[SudokuFunctionName];

export type WorkerInboundMessage = WasmInitMessage | WasmCallMessage;

// ok is parameterized by the called function so result is typed, not unknown.
type WasmOkMessage = {
  [K in SudokuFunctionName]: {
    type: 'ok';
    id: number;
    fn: K;
    result: SudokuFunctions[K]['result'];
    durationMs: number;
  };
}[SudokuFunctionName];

// All other response types — add entries here (e.g. progress) to extend the union.
interface WasmResponseTypes {
  error: { error: string };
}

type WasmSimpleMessage = {
  [K in keyof WasmResponseTypes]: { type: K; id: number } & WasmResponseTypes[K];
}[keyof WasmResponseTypes];

export type WasmResponseMessage = WasmOkMessage | WasmSimpleMessage;
