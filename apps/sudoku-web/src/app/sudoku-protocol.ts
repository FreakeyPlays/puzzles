export type WorkerFunctions = {
  get_factorial: { args: number; result: string };
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
