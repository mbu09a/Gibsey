import type { MiddlewareHandler } from 'hono';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // Placeholder logic for Better Auth integration
  const user = { id: 'anon' };
  c.set('user', user);
  await next();
};

