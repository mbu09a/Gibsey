import { describe, it, expect, beforeAll } from 'vitest';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';

// Simple smoke tests for auth functionality
describe('Authentication Smoke Tests', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'testPassword123';
  let passwordHash: string;

  beforeAll(async () => {
    // Hash password for tests
    passwordHash = await argon2.hash(testPassword);
  });

  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const hash = await argon2.hash(testPassword);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(testPassword);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify a correct password', async () => {
      const isValid = await argon2.verify(passwordHash, testPassword);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const isValid = await argon2.verify(passwordHash, 'wrongPassword');
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    const secret = 'test-secret';
    const payload = { userId: '123', email: testEmail };

    it('should generate a JWT token', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '7d' });
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify a valid token', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '7d' });
      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should reject an invalid token', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '7d' });
      expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
    });

    it('should reject an expired token', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '-1s' });
      expect(() => jwt.verify(token, secret)).toThrow();
    });
  });
});