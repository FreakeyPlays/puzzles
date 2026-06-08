import type { Difficulty, GenerateResult, HintResult, ValidateResult } from '@repo/sudoku-wasm';

export type WorkerFunctions = {
  generate: {
    args: { difficulty?: Difficulty; seed?: number };
    result: GenerateResult;
  };
  solve: {
    args: string;
    result: string | undefined;
  };
  validate: {
    args: string;
    result: ValidateResult;
  };
  hint: {
    args: string;
    result: HintResult | undefined;
  };
};

export type ArgsOf<K extends keyof WorkerFunctions> = WorkerFunctions[K] extends { args: infer A }
  ? A
  : never;

export type ResultOf<K extends keyof WorkerFunctions> = WorkerFunctions[K] extends {
  result: infer R;
}
  ? R
  : void;

export type WorkerInitMessage = {
  type: 'init';
  wasmUrl: string;
};

export type WorkerCallMessage = {
  [K in keyof WorkerFunctions]: {
    type: 'call';
    id: number;
    functionName: K;
  } & (WorkerFunctions[K] extends { args: infer A } ? { args: A } : object);
}[keyof WorkerFunctions];

export type WorkerInboundMessage = WorkerInitMessage | WorkerCallMessage;

export type WorkerOkResponse = {
  [K in keyof WorkerFunctions]: {
    type: 'ok';
    id: number;
    functionName: K;
    durationMs: number;
  } & (WorkerFunctions[K] extends { result: infer R } ? { result: R } : object);
}[keyof WorkerFunctions];

export type WorkerErrorResponse = {
  type: 'error';
  id: number;
  error: string;
};

export type WorkerResponse = WorkerOkResponse | WorkerErrorResponse;
