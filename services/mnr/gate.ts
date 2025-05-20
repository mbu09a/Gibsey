import type { GateMessage } from '../../packages/types/gate';

export type GateDB = {
  insert: (table: unknown) => { values: (data: unknown) => Promise<unknown> };
};

export type GateHandler = (msg: GateMessage) => Promise<void> | void;

export function createGate(db: GateDB, table: unknown) {
  const handlers: GateHandler[] = [];
  const processed = new Set<string>();

  async function logToVault(msg: GateMessage) {
    await db.insert(table).values({
      messageId: msg.id,
      context: 'Gate',
      fromWorld: msg.fromWorld,
      toWorld: msg.toWorld,
      payload: JSON.stringify(msg.payload),
      orientation: msg.orientation,
    });
  }

  async function deliver(handler: GateHandler, msg: GateMessage, attempt = 0): Promise<void> {
    try {
      await handler(msg);
    } catch (err) {
      if (attempt < 3) {
        setTimeout(() => deliver(handler, msg, attempt + 1), (attempt + 1) * 100);
      } else {
        console.error('Failed GateMessage delivery', msg.id, err);
      }
    }
  }

  async function sendGateMessage(msg: GateMessage): Promise<void> {
    if (processed.has(msg.id)) return;
    processed.add(msg.id);
    await logToVault(msg);
    for (const handler of handlers) {
      await deliver(handler, msg);
    }
  }

  function onGateMessage(handler: GateHandler): void {
    handlers.push(handler);
  }

  return { sendGateMessage, onGateMessage };
}
