export interface IStats<T> {
  start: string;
  runs: number;
  end: number;
  elapsed: number;
  always: boolean;
  timeout: number;
  value: T;
}

export default convergeOn;

declare function convergeOn<T>(
  assertion: convergeOn.Assertion<T>,
  timeout?: number,
  always?: boolean
): Promise<IStats<T>>;

declare namespace convergeOn {
  export type Assertion<T> = () => T;
}
