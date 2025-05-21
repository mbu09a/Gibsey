export enum Action {
  Read,
  Index,
  Link,
  Prompt,
  React,
  Write,
  Save,
  Merge,
  Forget,
  Dream
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
