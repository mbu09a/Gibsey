import type { Config } from 'drizzle-kit';

export default {
  schema: './packages/db/src/schema.ts',
  out: './packages/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './db.sqlite',
  },
} satisfies Config;