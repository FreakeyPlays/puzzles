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

export type WasmResponseMessage =
  | { type: 'ok'; id: number; result: unknown; durationMs: number }
  | { type: 'error'; id: number; error: string };
