export type Thunk<T> = () => T;

export interface IStats {
  start: number;
  runs: number;
  end: number;
  elapsed: number;
  timeout?: number;
  always?: boolean;
  value?: boolean;
  queue?: Array<IStats>;
}
