import { Hono } from 'hono';
import type { Context } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { pages, sections, qdpiMoves, pageNotes, vaultEntries } from '../../../packages/db/src/schema';
import { symbolMetadata } from '../../../the-corpus/symbols/metadata';
import { eq, and, like, desc, gte, lte } from 'drizzle-orm';
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
import { t, AppContext } from './trpc';
import { TRPCError } from '@trpc/server'; // Explicit import for TRPCError
import { requireRole } from './middleware/requireRole';
import { roleCapabilities, RoleType } from '../../../packages/types/roles';
import { qdpiActionCapabilities } from '../../../packages/types/actionPermissions';

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
  savePageNote: t.procedure
    .input(
      z.object({
        pageId: z.number(),
        noteText: z.string().min(1),
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement Role-based access control (e.g., Role.Guest restrictions).
      // const userRole = ctx.user?.role;
      // if (userRole === Role.Guest) { throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Guests cannot save notes.' }); }

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
        userId: input.userId,
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
    .mutation(async ({ input, ctx }) => { // Added ctx for user role
      // Permission Check Logic
      const userRole = ctx.user?.role as RoleType | undefined;

      if (!userRole || !roleCapabilities[userRole]) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User role is invalid or not found.',
        });
      }

      const actionName = Action[input.action] as keyof typeof Action; // Action is already imported
      const requiredCapability = qdpiActionCapabilities[actionName];

      if (requiredCapability) {
        const userCapabilities = roleCapabilities[userRole]; // userRole is validated above
        if (!userCapabilities.includes(requiredCapability)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Your role ('${userRole}') does not have the required capability ('${requiredCapability}') to perform the action '${actionName}'.`,
          });
        }
      }
      // If requiredCapability is undefined, the action is allowed by default.

      // Existing logic
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
      }).returning({ insertedId: qdpiMoves.id });

      return { success: true, moveId: result[0].insertedId };
    }),

  // The classic Vault logDream endpoint, for backward compatibility and for UI logging.
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

  getCorpusMetadata: t.procedure.query(async () => {
    return { colors: colorMap };
  }),

  getQdpiMoveById: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(qdpiMoves)
        .where(eq(qdpiMoves.id, input.id));
      return result[0] || null;
    }),

  getQdpiMovesByNumericGlyph: t.procedure
    .input(z.object({ numericGlyph: z.number() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(qdpiMoves)
        .where(eq(qdpiMoves.numericGlyph, input.numericGlyph))
        .orderBy(desc(qdpiMoves.timestamp));
    }),

  getQdpiMoves: t.procedure
    .input(
      z.object({
        filter: z
          .object({
            action: z.nativeEnum(Action).optional(),
            context: z.nativeEnum(GlyphContext).optional(),
            state: z.nativeEnum(State).optional(),
            role: z.nativeEnum(Role).optional(),
            relation: z.nativeEnum(Relation).optional(),
            polarity: z.nativeEnum(Polarity).optional(),
            rotation: z.nativeEnum(Rotation).optional(),
            modality: z.nativeEnum(Modality).optional(),
            userId: z.string().optional(),
            startDate: z.number().int().positive().optional(),
            endDate: z.number().int().positive().optional(),
          })
          .optional(),
        limit: z.number().int().positive().optional().default(50),
        offset: z.number().int().nonnegative().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const conditions = [];
      if (input.filter) {
        if (input.filter.action !== undefined) {
          conditions.push(eq(qdpiMoves.action, input.filter.action));
        }
        if (input.filter.context !== undefined) {
          conditions.push(eq(qdpiMoves.context, input.filter.context));
        }
        if (input.filter.state !== undefined) {
          conditions.push(eq(qdpiMoves.state, input.filter.state));
        }
        if (input.filter.role !== undefined) {
          conditions.push(eq(qdpiMoves.role, input.filter.role));
        }
        if (input.filter.relation !== undefined) {
          conditions.push(eq(qdpiMoves.relation, input.filter.relation));
        }
        if (input.filter.polarity !== undefined) {
          conditions.push(eq(qdpiMoves.polarity, input.filter.polarity));
        }
        if (input.filter.rotation !== undefined) {
          conditions.push(eq(qdpiMoves.rotation, input.filter.rotation));
        }
        if (input.filter.modality !== undefined) {
          conditions.push(eq(qdpiMoves.modality, input.filter.modality));
        }
        if (input.filter.userId !== undefined) {
          conditions.push(eq(qdpiMoves.userId, input.filter.userId));
        }
        if (input.filter.startDate !== undefined) {
          conditions.push(gte(qdpiMoves.timestamp, new Date(input.filter.startDate)));
        }
        if (input.filter.endDate !== undefined) {
          conditions.push(lte(qdpiMoves.timestamp, new Date(input.filter.endDate)));
        }
      }

      const query = db
        .select()
        .from(qdpiMoves)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(qdpiMoves.timestamp))
        .limit(input.limit)
        .offset(input.offset);

      return query;
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
// @ts-expect-error Hono type inference issue (documented upstream)
app.use('/trpc/*', trpcServer({ router: appRouter }));