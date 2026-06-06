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

interface WasmResponseTypes {
  ok: { result: unknown; durationMs: number };
  error: { error: string };
}

export type WasmResponseMessage = {
  [K in keyof WasmResponseTypes]: { type: K; id: number } & WasmResponseTypes[K];
}[keyof WasmResponseTypes];
