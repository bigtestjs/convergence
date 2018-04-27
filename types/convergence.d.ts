import { IStats } from './converge-on';

export type Assertion<T, U> = (previous: U) => T;

export type SideEffect<T, U> = (previous: U) => T;

export default Convergence;

declare class Convergence<T> {
  constructor(timeout?: number);
  timeout(timeout: number): Convergence<T>;
  timeout(): number;
  when<U>(assertion: Assertion<U, T>): Convergence<U>;
  once<U>(assertion: Assertion<U, T>): Convergence<U>;
  always<U>(assertion: Assertion<U, T>, timeout: number): Convergence<U>;
  do<U>(callback: SideEffect<U, T>): Convergence<U>;
  append<U>(convergence: Convergence<U>): Convergence<U>;
  run(): Promise<IStats<T>>;
}
