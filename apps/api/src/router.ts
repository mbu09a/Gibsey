import { Hono } from 'hono';
import { initTRPC } from '@trpc/server';
import type { Context } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { pages, sections } from '../../../packages/db/src/schema';
import { readdirSync } from 'fs';
import { join } from 'path';
import { eq, and, like } from 'drizzle-orm';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware';
import { sectionColors } from '../../../packages/utils/sectionColors';

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
      if (!result[0]) return null;
      return { ...result[0], color: sectionColors[result[0].section] ?? '#00FF00' };
    }),

  getPagesBySection: t.procedure
    .input(z.object({ section: z.number() }))
    .query(async ({ input }) => {
      const res = await db
        .select(pageSelect)
        .from(pages)
        .where(eq(pages.section, input.section));
      return res.map(p => ({ ...p, color: sectionColors[p.section] ?? '#00FF00' }));
    }),

  searchPages: t.procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const res = await db
        .select(pageSelect)
        .from(pages)
        .where(like(pages.text, `%${input.query}%`));
      return res.map(p => ({ ...p, color: sectionColors[p.section] ?? '#00FF00' }));
    }),

  getPagesBySymbol: t.procedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      const res = await db
        .select(pageSelect)
        .from(pages)
        .where(eq(pages.symbol, input.symbol));
      return res.map(p => ({ ...p, color: sectionColors[p.section] ?? '#00FF00' }));
    }),

  getSections: t.procedure.query(async () => {
    const secs = await db.select().from(sections);
    return secs.map(s => ({ ...s, color: sectionColors[s.id] ?? '#00FF00' }));
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