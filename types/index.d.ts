export declare function when<T = undefined>(assertion: () => T): PromiseLike<Stats<T>>;
export declare function always<T = undefined>(assertion: () => T, timeout?: number): PromiseLike<Stats<T>>;
export declare function isConvergence(obj: any): boolean
export default Convergence;

declare class Convergence<R = undefined> implements PromiseLike<R> {
  static isConvergence(obj: any): boolean;
  constructor(timeout: number);
  timeout(): number;
  timeout(timeout: number): Convergence<R>;
  when(assertion: (value: R) => undefined): Convergence<R>;
  when<U>(assertion: (value: R) => U): Convergence<U>;
  always(assertion: (value: R) => undefined, timeout?: number): Convergence<R>;
  always<U>(assertion: (value: R) => U, timeout?: number): Convergence<U>;
  do(callback: (value: R) => undefined): Convergence<R>;
  do<U>(callback: (value: R) => U | PromiseLike<U> | Convergence<U>): Convergence<U>;
  append<U = undefined>(convergence: Convergence<U>): Convergence<U>;
  run(): Promise<Stats<R>>;
  then(): Promise<R>;
}

declare interface Stats<T = void> {
  start: number,
  runs: number,
  end: number,
  elapsed: number,
  always?: boolean,
  timeout?: number,
  queue?: Array<Stats>,
  value: T
}
