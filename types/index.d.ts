// Type definitions for @bigtest
// Project: https://github.com/bigtestjs/interactor
// Definitions by: Wil Wilsman<hello@wilwilsman.com>, Taras Mankovski <taras@frontside.io>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "@bigtest/convergence" {
  /**
   * Converges on an assertion by resolving when the given assertion
   * passes _within_ the timeout period. The assertion will run once
   * every 10ms and is considered to be passing when it does not error
   * or return false. If the assertion never passes within the timeout
   * period, then the promise will reject as soon as it can with the
   * last error it recieved.
   */
  export function when<T = undefined>(assertion: () => T): PromiseLike<Stats<T>>;

  /**
   * Converges on an assertion by resolving when the given assertion
   * passes _throughout_ the timeout period. The assertion will run once
   * every 10ms and is considered to be passing when it does not error
   * or return false. If the assertion does not pass consistently
   * throughout the entire timeout period, it will reject the very first
   * time it encounters a failure.
   */
  export function always<T = undefined>(assertion: () => T, timeout?: number): PromiseLike<Stats<T>>;

  /**
   * Returns `true` if the object has common convergence properties of 
   * the correct type.
   */
  export function isConvergence(obj: any): boolean

  /**
   * A convergence is an assertion that is satisfied when state is matched 
   * or fails if it's not able to match the state before the timeout is reached.
   */
  export default class Convergence<R = undefined> implements PromiseLike<R> {
    static isConvergence(obj: any): boolean;
    /**
     * The constructor actually takes two params, `options` and
     * `previous`. Publicly, `options` is `timeout`, but internally, new
     * instances receive new `options` in addition to the `previous`
     * instance. This allows things that extend convergences to still be
     * immutable, but requires that they have deeper knowledge of the
     * internal API.
     */
    constructor(timeout: number);

    /**
     * Returns the current timeout for this instance.
     */
    timeout(): number;

    /**
     * Returns a new convergence instance with the given timeout,
     * inheriting the current instance's assertions.
     */
    timeout<R>(timeout: number): Convergence<R>;

    /**
     * Returns a new convergence instance with an additional assertion.
     * This assertion is run repeatedly until it passes within the
     * timeout. If the assertion does not pass within the timeout, the
     * convergence will fail.
     */    
    when(assertion: (value: R) => undefined): Convergence<R>;
    when<U>(assertion: (value: R) => U): Convergence<U>;

    /**
     * Returns a new convergence instance with an additional assertion.
     * This assertion is run repeatedly to ensure it passes throughout
     * the timeout. If the assertion fails at any point during the
     * timeout, the convergence will fail.
     */
    always(assertion: (value: R) => undefined, timeout?: number): Convergence<R>;
    always<U>(assertion: (value: R) => U, timeout?: number): Convergence<U>;

    /**
     * Returns a new convergence instance with a callback added to its
     * queue. When a running convergence instance encounters a callback,
     * it will be invoked with the value returned from the last function
     * in the queue. The resulting return value will also be provided to
     * the following function in the queue. If the return value is
     * undefined, the previous return value will be retained.
     */
    do(callback: (value: R) => undefined): Convergence<R>;
    do<U>(callback: (value: R) => U | PromiseLike<U> | Convergence<U>): Convergence<U>;

    /**
     * Appends another convergence's queue to this convergence's queue
     * to allow composing different convergences together.
     */
    append<U = undefined>(convergence: Convergence<U>): Convergence<U>;

    /**
     * Runs the current convergence instance, returning a promise that
     * will resolve after all assertions have converged, or reject when
     * any of them fail.
     */
    run(): Promise<Stats<R>>;

    /**
     * By being thennable we can enable the usage of async/await syntax
     * with convergences. This allows us to naturally chain convergences
     * without calling `#run()`.
     */
    then<R>(): Promise<R>;
  }

  export interface Stats<T = void> {
    start: number,
    runs: number,
    end: number,
    elapsed: number,
    always?: boolean,
    timeout?: number,
    queue?: Array<Stats>,
    value: T
  }
}
