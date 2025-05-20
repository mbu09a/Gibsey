import type { MiddlewareHandler } from 'hono';
import { Role } from '../../../packages/types';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // Placeholder logic for Better Auth integration
  const user = { id: 'anon', role: Role.Guest };
  c.set('user', user);
  await next();
};

