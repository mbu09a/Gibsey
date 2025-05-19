import { Hono } from 'hono';
import { initTRPC } from '@trpc/server';
import type { Context } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { pages, sections } from '../../packages/db/src/schema';
import { readdirSync } from 'fs';
import { join } from 'path';
import { eq, and, like } from 'drizzle-orm';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware';

export const db = drizzle(new Database('db.sqlite'));

export type AppContext = Context & { user: unknown };
const t = initTRPC.context<AppContext>().create();

const pageSelect = {
  id: pages.id,
  section: pages.section,
  sectionName: pages.sectionName,
  symbol: pages.symbol,
  pageNumber: pages.pageNumber,
  globalIndex: pages.globalIndex,
  text: pages.text,
};

export const appRouter = t.router({
  getPageById: t.procedure
    .input(
      z.object({ section: z.number(), index: z.number() })
    )
    .query(async ({ input }) => {
      const result = await db
        .select(pageSelect)
        .from(pages)
        .where(and(eq(pages.section, input.section), eq(pages.pageNumber, input.index)));
      return result[0] ?? null;
    }),

  getPagesBySection: t.procedure
    .input(z.object({ section: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select(pageSelect)
        .from(pages)
        .where(eq(pages.section, input.section));
    }),

  getPagesBySymbol: t.procedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(pages)
        .where(eq(pages.corpusSymbol, input.symbol));
    }),

  searchPages: t.procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select(pageSelect)
        .from(pages)
        .where(like(pages.text, `%${input.query}%`));
    }),

  getPagesBySymbol: t.procedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select(pageSelect)
        .from(pages)
        .where(eq(pages.symbol, input.symbol));
    }),

  getSections: t.procedure.query(async () => {
    return await db.select().from(sections);
  }),

  getSymbols: t.procedure.query(async () => {
    const dir = join(__dirname, '../../the-corpus/symbols');
    const files = readdirSync(dir);
    return files.filter((f) => f.endsWith('.svg'));
  }),
});

export type AppRouter = typeof appRouter;

export const app = new Hono<AppContext>();

app.use('/trpc/*', authMiddleware);
app.use('/trpc/*', trpcServer({ router: appRouter }));


