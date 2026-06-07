import type { Difficulty } from '../models/difficulty.model';

export type { Difficulty };

export type GenerateResult = {
  puzzle: string;
  solution: string;
  difficulty: Difficulty;
  seed: number;
};

export type ValidateResult = {
  valid: boolean;
  solved: boolean;
  conflicts: number[];
};

export type HintResult = {
  index: number;
  value: number;
  technique: string;
};

export type WorkerFunctions = {
  generate: {
    args: { difficulty?: Difficulty; seed?: number };
    result: GenerateResult;
  };
  solve: {
    args: string;
    result: string | null;
  };
  validate: {
    args: string;
    result: ValidateResult;
  };
  hint: {
    args: string;
    result: HintResult | null;
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
    fn: K;
  } & (WorkerFunctions[K] extends { args: infer A } ? { args: A } : object);
}[keyof WorkerFunctions];

export type WorkerInboundMessage = WorkerInitMessage | WorkerCallMessage;

export type WorkerOkResponse = {
  [K in keyof WorkerFunctions]: {
    type: 'ok';
    id: number;
    fn: K;
    durationMs: number;
  } & (WorkerFunctions[K] extends { result: infer R } ? { result: R } : object);
}[keyof WorkerFunctions];

export type WorkerErrorResponse = {
  type: 'error';
  id: number;
  error: string;
};

export type WorkerResponse = WorkerOkResponse | WorkerErrorResponse;
