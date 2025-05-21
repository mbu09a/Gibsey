import { Hono } from 'hono';
import { initTRPC } from '@trpc/server';
import type { Context } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { pages, sections, qdpiMoves, pageNotes } from '../../../packages/db/src/schema';
import { symbolMetadata } from '../../../the-corpus/symbols/metadata';
import { eq, and, like } from 'drizzle-orm';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware';
import colorMap from '../../../the-corpus/colors';
import {
  Glyph,
  Action,
  Context as GlyphContext,
  State,
  Role,
  Relation,
  Polarity,
  Rotation,
  Modality,
  encodeGlyphNumeric,
} from '../../../packages/utils/glyphCodec';
import { join } from 'path';
import { readdirSync } from 'fs';

export const db = drizzle(new Database('db.sqlite'));

export type AppContext = Context & { user: unknown };
const t = initTRPC.context<AppContext>().create();

// TODO: Define mutations for actions like 'Merge' that may be restricted to,
// or overseen by, Role.MythicGuardian.
// Example: A mergeArtifacts mutation would check:
// if (ctx.user?.role !== Role.MythicGuardian) { throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Only Mythic Guardians can perform merges.' }); }

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
  savePageNote: t.procedure
    .input(
      z.object({
        pageId: z.number(),
        noteText: z.string().min(1),
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement Role-based access control.
      // If user is Role.Guest, this action might be disallowed or require approval.
      // const userRole = ctx.user?.role; // Example: assuming role is on user context
      // if (userRole === Role.Guest) { throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Guests cannot save notes without approval.' }); }

      // 1. Save the note
      const noteResult = await db.insert(pageNotes).values({
        pageId: input.pageId,
        noteText: input.noteText,
        userId: input.userId,
      }).returning({ insertedId: pageNotes.id });

      const newNoteId = noteResult[0].insertedId;

      // 2. Log the QDPI move
      const glyphData: Glyph = {
        action: Action.Write,
        context: GlyphContext.Reaction,
        state: State.Private,
        role: Role.Human,
        relation: Relation.S2O,
        polarity: Polarity.Internal,
        rotation: Rotation.N,
        modality: Modality.Text,
      };
      const numericGlyph = encodeGlyphNumeric(glyphData);

      await db.insert(qdpiMoves).values({
        numericGlyph,
        action: glyphData.action,
        context: glyphData.context,
        state: glyphData.state,
        role: glyphData.role,
        relation: glyphData.relation,
        polarity: glyphData.polarity,
        rotation: glyphData.rotation,
        modality: glyphData.modality,
        userId: input.userId, // Use the userId from the input
        operationDetails: `Saved note on pageId: ${input.pageId}, noteId: ${newNoteId}`,
      });

      return { success: true, newNoteId };
    }),

  logQdpiMove: t.procedure
    .input(
      z.object({
        action: z.nativeEnum(Action),
        context: z.nativeEnum(GlyphContext),
        state: z.nativeEnum(State),
        role: z.nativeEnum(Role),
        relation: z.nativeEnum(Relation),
        polarity: z.nativeEnum(Polarity),
        rotation: z.nativeEnum(Rotation),
        modality: z.nativeEnum(Modality).optional(),
        userId: z.string().optional(),
        operationDetails: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const modality = input.modality ?? Modality.Text;
      const glyphData: Glyph = {
        action: input.action,
        context: input.context,
        state: input.state,
        role: input.role,
        relation: input.relation,
        polarity: input.polarity,
        rotation: input.rotation,
        modality: modality,
      };
      const numericGlyph = encodeGlyphNumeric(glyphData);

      const result = await db.insert(qdpiMoves).values({
        numericGlyph,
        action: input.action,
        context: input.context,
        state: input.state,
        role: input.role,
        relation: input.relation,
        polarity: input.polarity,
        rotation: input.rotation,
        modality: modality,
        userId: input.userId,
        operationDetails: input.operationDetails,
      }).returning({ insertedId: qdpiMoves.id }); // Correct way to get last inserted ID with Drizzle

      return { success: true, moveId: result[0].insertedId };
    }),

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

  getCorpusMetadata: t.procedure.query(async () => {
    return { colors: colorMap };
  }),
});

export type AppRouter = typeof appRouter;

export const app = new Hono<AppContext>();

app.use('/trpc/*', authMiddleware);
// TODO: Fix this type error, it's a known issue with Hono and tRPC
// @ts-expect-error Hono type inference issue
app.use('/trpc/*', trpcServer({ router: appRouter }));