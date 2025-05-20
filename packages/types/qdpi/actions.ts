export enum Action {
  Read,
  Index,
  Prompt,
  React,
  Write,
  Save,
  Forget,
  Dream,
  Link,
  Merge
}

export function encodeAction(a: Action): number {
  return a as number;
}

export function decodeAction(n: number): Action {
  if (n in Action) {
    return n as Action;
  }
  throw new RangeError(`Invalid action slot: ${n}`);
}
