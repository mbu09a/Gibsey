import type { MiddlewareHandler } from 'hono';
import { Role } from '../../../packages/types';
import { verifyToken } from '../src/auth/authService';
import { db } from '../src/router';
import { users } from '../../../packages/db/src/schema';
import { eq } from 'drizzle-orm';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const user = { id: 'anon', email: 'anonymous', role: Role.Guest };
    c.set('user', user);
    await next();
    return;
  }

  try {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    const dbUser = await db.select().from(users).where(eq(users.id, payload.userId)).get();
    
    if (!dbUser) {
      const user = { id: 'anon', email: 'anonymous', role: Role.Guest };
      c.set('user', user);
      await next();
      return;
    }

    const user = {
      id: dbUser.id,
      email: dbUser.email,
      role: Role.Human, // Default authenticated users to Human role
    };
    
    c.set('user', user);
    await next();
  } catch (error) {
    const user = { id: 'anon', email: 'anonymous', role: Role.Guest };
    c.set('user', user);
    await next();
  }
};

