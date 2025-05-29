import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { db } from '../router';
import { users } from '../../../../packages/db/src/schema';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

const JWT_SECRET = process.env.AUTH_SECRET || 'default-secret-change-me';

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
}

export async function createUser(email: string, password: string) {
  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  
  if (existingUser) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'User with this email already exists',
    });
  }

  const passwordHash = await hashPassword(password);
  const newUser = await db.insert(users).values({
    email,
    passwordHash,
  }).returning().get();

  return newUser;
}

export async function authenticateUser(email: string, password: string) {
  const user = await db.select().from(users).where(eq(users.email, email)).get();
  
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    });
  }

  const isValidPassword = await verifyPassword(user.passwordHash, password);
  
  if (!isValidPassword) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    });
  }

  return user;
}