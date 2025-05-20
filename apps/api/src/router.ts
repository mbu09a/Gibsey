import { Hono } from 'hono';
import type { Context } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { pages, sections, vaultEntries } from '../../../packages/db/src/schema';
import { symbolMetadata } from '../../../the-corpus/symbols/metadata';
import { eq, and, like } from 'drizzle-orm';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware';
import colorMap from '../../../the-corpus/colors';
import { join } from 'path';
import { readdirSync } from 'fs';
import { t, AppContext } from './trpc';
import { requireRole } from './middleware/requireRole';

export const db = drizzle(new Database('db.sqlite'));

const pageSelect = {
  id: pages.id,
  section: pages.section,
  sectionName: pages.sectionName,
  corpusSymbol: pages.corpusSymbol,
  pageNumber: pages.pageNumber,
  globalIndex: pages.globalIndex,
  text: pages.text,
};

export const appRouter = t.router({
  getPageById: t.procedure
    .input(z.object({ section: z.number(), index: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select(pageSelect)
        .from(pages)
        .where(and(eq(pages.section, input.section), eq(pages.pageNumber, input.index)));
      if (!result[0]) return null;
      const sectionColor = colorMap[result[0].sectionName] ?? '#00FF00';
      return { ...result[0], color: sectionColor };
    }),

  getPagesBySection: t.procedure
    .input(z.object({ section: z.number() }))
    .query(async ({ input }) => {
      const res = await db
        .select(pageSelect)
        .from(pages)
        .where(eq(pages.section, input.section));
      return res.map(p => ({
        ...p,
        color: colorMap[p.sectionName] ?? '#00FF00'
      }));
    }),

  searchPages: t.procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const res = await db
        .select(pageSelect)
        .from(pages)
        .where(like(pages.text, `%${input.query}%`));
      return res.map(p => ({
        ...p,
        color: colorMap[p.sectionName] ?? '#00FF00'
      }));
    }),

  getPagesBySymbol: t.procedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      const res = await db
        .select(pageSelect)
        .from(pages)
        .where(eq(pages.corpusSymbol, input.symbol));
      return res.map(p => ({
        ...p,
        color: colorMap[p.sectionName] ?? '#00FF00'
      }));
    }),

  getSections: t.procedure.query(async () => {
    const secs = await db.select().from(sections);
    return secs.map(s => ({
      ...s,
      color: colorMap[s.sectionName] ?? '#00FF00'
    }));
  }),

  getSymbols: t.procedure.query(async () => {
    if (symbolMetadata && Array.isArray(symbolMetadata) && symbolMetadata.length > 0) {
      return symbolMetadata;
    }
    // Fallback: read from directory
    const dir = join(__dirname, '../../../the-corpus/symbols');
    const files = readdirSync(dir);
    return files.filter((f) => f.endsWith('.svg'));
  }),

  logDream: t.procedure
    .input(
      z.object({
        action: z.string(),
        context: z.string(),
        state: z.string(),
        role: z.string(),
        relation: z.string(),
        polarity: z.string(),
        rotation: z.string(),
        content: z.string(),
        actorId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(vaultEntries).values({
        action: input.action,
        context: input.context,
        state: input.state,
        role: input.role,
        relation: input.relation,
        polarity: input.polarity,
        rotation: input.rotation,
        content: input.content,
        actorId: input.actorId,
        createdAt: Date.now(),
      });
      return { success: true };
    }),

  getCorpusMetadata: t.procedure.query(async () => {
    return { colors: colorMap };
  }),

  mergeEntries: t.procedure
    .use(requireRole(['MythicGuardian']))
    .input(z.object({ sourceId: z.number(), targetId: z.number() }))
    .mutation(async () => {
      // placeholder merge logic; see permissionsMap in packages/types
      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;

export const app = new Hono<AppContext>();

app.use('/trpc/*', authMiddleware);
app.use('/trpc/*', trpcServer({ router: appRouter }));
