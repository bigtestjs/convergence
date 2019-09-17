import { Thunk, IStats } from './types';
import { Assertion } from './convergence';

const { now } = Date;

/**
 * Captures a promise that will only resolve once a given condition
 * has been met. The condition will be tested once every 10ms and is
 * considered to be met when it does not error or return false.
 *
 * When `always` is false, the promise will resolve as soon as the
 * condition has been met. If it fails to do so within the timeout, it
 * will reject as soon as it can with the last error it received.
 *
 * When `always` is true, the promise will only resolve if the
 * condition is met consistently throughout the entire timeout
 * period. It will reject the first time it encounters an error.
 *
 * @private
 * @function convergeOn
 * @param assertion - Run to test condition repeatedly
 * @param timeout - Milliseconds to check assertion
 * @param always - If true, the assertion must pass
 * throughout the entire timeout period
 * @returns Resolves if the assertion passes at least once;
 * if `always` is true, then rejects at the first error instead
 */
export function convergeOn(assertion: Assertion, timeout: number, always: boolean): Promise<IStats> {
  let start = now();
  let interval = 10;
  let bail = false;

  // track various stats
  let stats: IStats = {
    start,
    runs: 0,
    end: start,
    elapsed: 0,
    always,
    timeout,
    value: undefined
  };

  return new Promise((resolve, reject) => {
    (function loop() {
      // track stats
      stats.runs += 1;

      try {
        // @ts-ignore
        // `this` is bound in `runAssertion`
        let results = assertion();

        // a promise means there could be side-effects; bail
        if (isPromise(results)) {
          bail = true;

          throw new Error(
            'convergent assertion encountered a async function or promise; ' +
            'since convergent assertions can run multiple times, you should ' +
            'avoid introducing side-effects inside of them'
          );
        }

        // the timeout calculation comes after the assertion so that
        // the assertion's execution time is accounted for
        let doLoop = now() - start < timeout;

        if (always && doLoop) {
          setTimeout(loop, interval);
        } else if (results === false) {
          throw new Error('convergent assertion returned `false`');
        } else if (!always && !doLoop) {
          throw new Error(
            'convergent assertion was successful, ' +
            `but exceeded the ${timeout}ms timeout`
          );
        } else {
          // calculate some stats right before resolving with them
          stats.end = now();
          stats.elapsed = stats.end - start;
          stats.value = results;
          resolve(stats);
        }
      } catch (error) {
        let doLoop = now() - start < timeout;

        if (!bail && !always && doLoop) {
          setTimeout(loop, interval);
        } else if (bail || always || !doLoop) {
          reject(error);
        }
      }
    })();
  });
}

/**
 * Helper to check if a value is `Promise`-like.
 *
 * @private
 * @param val - value to check
 * @returns true if the value is promise-like, false if not
 */
function isPromise(val: any): val is PromiseLike<unknown> {
  return val && typeof val.then === 'function';
}

/**
 * Helper to defer the execution of a `Promise` until `then`
 * is called on it.
 *
 * @private
 * @param fn - thunk containing the `Promise` to defer
 * @returns function with a then method
 */
function deferPromise<T>(fn: Thunk<PromiseLike<T>>): Thunk<PromiseLike<T>> & PromiseLike<T> {
  return Object.defineProperty(fn, 'then', {
    value: (
      onfulfilled: <U>(val: T) => U,
      onrejected: <U>(reason: any) => U
    ) => fn().then(onfulfilled, onrejected)
  });
}

/**
 * Converges on an assertion by resolving when the given assertion
 * passes _within_ the timeout period. The assertion will run once
 * every 10ms and is considered to be passing when it does not error
 * or return false. If the assertion never passes within the timeout
 * period, then the promise will reject as soon as it can with the
 * last error it recieved.
 *
 * ```javascript
 * // simple boolean test
 * await when(() => total === 100)
 *
 * // with chai assertions
 * await when(() => {
 *   expect(total).to.equal(100)
 *   expect(add(total, 1)).to.equal(101)
 * })
 * ```
 *
 * The `timeout` argument controls how long the assertion is given to
 * converge within. By default, this is `2000ms`.
 *
 * ```javascript
 * // will fail if `num` is not `1` within 100ms
 * await when(() => num === 1, 100)
 * ```
 *
 * Returns a thennable function that can be used as a callback where
 * libraries support async functions.
 *
 * ```javascript
 * // mocha's `it` supports async tests
 * it('becomes bar within one second', when(() => {
 *   expect(foo).to.equal('bar');
 * }, 1000));
 * ```
 *
 * @function when
 * @param assertion - Assertion to converge on
 * @param [timeout=2000] - Timeout in milliseconds
 * @returns thennable function that resolves when the
 * assertion converges
 */
export function when(assertion: Assertion, timeout = 2000) {
  return deferPromise(() => convergeOn(assertion, timeout, false));
}

/**
 * Converges on an assertion by resolving when the given assertion
 * passes _throughout_ the timeout period. The assertion will run once
 * every 10ms and is considered to be passing when it does not error
 * or return false. If the assertion does not pass consistently
 * throughout the entire timeout period, it will reject the very first
 * time it encounters a failure.
 *
 * ```javascript
 * // simple boolean test
 * await always(() => total !== 100)
 *
 * // with chai assertions
 * await always(() => {
 *   expect(total).to.not.equal(100)
 *   expect(add(total, 1)).to.equal(101)
 * })
 * ```
 *
 * The `timeout` argument controls how long it will take for the
 * assertion to converge. By default, this is `200ms`.
 *
 * ```javascript
 * // will pass if `num` is less than `100` for 2 seconds
 * await always(() => num < 100, 2000)
 * ```
 *
 * Returns a thennable function that can be used as a callback where
 * libraries support async functions.
 *
 * ```javascript
 * // mocha's `it` supports async tests
 * it('stays foo for one second', always(() => {
 *   expect(foo).to.equal('foo');
 * }, 1000));
 * ```
 *
 * @function always
 * @param assertion - Assertion to converge with
 * @param [timeout=200] - Timeout in milliseconds
 * @returns thennable function that resolves when the
 * assertion converges
 */
export function always(assertion: Assertion, timeout = 200) {
  return deferPromise(() => convergeOn(assertion, timeout, true));
}
